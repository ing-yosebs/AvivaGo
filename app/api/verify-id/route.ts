import { createClient } from '@/lib/supabase/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { image, backImage, documentType } = await request.json(); // image = frontImage

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const client = new ImageAnnotatorClient();

        // Helper to process a single image
        const detectText = async (base64Img: string) => {
            const cleanBase64 = base64Img.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(cleanBase64, 'base64');
            const [result] = await client.textDetection(buffer);
            return result.textAnnotations?.[0]?.description || '';
        };

        // Process Front
        const frontText = await detectText(image);

        // Process Back (if provided)
        let backText = '';
        if (backImage) {
            backText = await detectText(backImage);
        }

        const fullText = `${frontText}\n\n${backText}`;

        if (!fullText.trim()) {
            return NextResponse.json({ error: 'No text detected' }, { status: 400 });
        }

        // Parse Data based on Document Type
        const parsedData = parseDocumentData(fullText, documentType);

        // TODO: Persist verification attempt in Supabase if needed (e.g. audit log)

        return NextResponse.json({
            success: true,
            data: parsedData,
            rawText: fullText
        });

    } catch (error: any) {
        console.error('SERVER ERROR processing ID:', error);
        // Log deep details if available (e.g. Google Cloud specific errors)
        if (error.response) console.error('GCloud Response Error:', JSON.stringify(error.response, null, 2));
        if (error.details) console.error('GCloud Details:', error.details);

        return NextResponse.json({
            error: 'Error processing identification',
            details: error.message || 'Unknown backend error'
        }, { status: 500 });
    }
}

function parseDocumentData(text: string, type: string) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    let data = {
        name: '',
        address: '',
        curp: '',
        claveElector: '',
        passportNumber: '',
        mrz: '',
        birthDate: '',
        expirationDate: '',
        sex: '',
        nationality: '',
        documentType: type,
        rawText: text
    };

    // --- SHARED REGEX ---
    const curpRegex = /[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}/;
    // Clave Elector: Usually 18 chars. Old format: 6 chars + 8 digits + 1 char + 3 digits. New: 18 chars.
    // Heuristic: continuous block of 18 alphanum chars, often starting with letters from name.
    const claveElectorRegex = /[A-Z]{6}\d{8}[A-Z]\d{3}/;
    const dateRegex = /(\d{2})[/-](\d{2})[/-](\d{4})/;

    // Function to clean CURP/Alphanum from OCR noise
    const cleanAlphanum = (raw: string) => {
        return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
    };

    // --- STRATEGY: INE / IFE / ID ---
    if (type === 'ine' || type === 'national_id') {
        const cleanText = text.replace(/\s+/g, ''); // For seeking continuous blocks

        // 1. CURP
        const curpMatch = text.match(curpRegex);
        if (curpMatch) data.curp = cleanAlphanum(curpMatch[0]);

        // 2. Clave Elector (Try regex on full text or lines)
        // Try finding "CLAVE DE ELECTOR" label first
        const electorIndex = lines.findIndex(l => l.includes('ELECTOR'));
        if (electorIndex !== -1) {
            // Look in next few lines
            for (let i = electorIndex; i < Math.min(electorIndex + 3, lines.length); i++) {
                const match = lines[i].match(/[A-Z]{6}\d{8}[H,M]\d{3}/) || lines[i].match(/[A-Z]{6}\d{8}[0-9]{4}/);
                if (match) {
                    data.claveElector = cleanAlphanum(match[0]);
                    break;
                }
            }
        }
        // Fallback: search for pure 18-char pattern in lines if not found
        if (!data.claveElector) {
            const potentialClave = lines.find(l => l.match(/^[A-Z]{6}\d{8}/));
            if (potentialClave) data.claveElector = cleanAlphanum(potentialClave.substring(0, 18));
        }

        // 3. Name (Heuristic: Look for "NOMBRE" keyword)
        const nameIndex = lines.findIndex(l => l.includes('NOMBRE'));
        if (nameIndex !== -1 && nameIndex + 1 < lines.length) {
            const potentialNameParts = [];
            for (let i = nameIndex + 1; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('DOMICILIO') || line.includes('CLAVE') || line.includes('SEXO') || line.includes('FECHA')) break;
                potentialNameParts.push(line);
            }
            data.name = potentialNameParts.join(' ');
        }

        // 4. Address (Heuristic: Look for "DOMICILIO")
        const addressIndex = lines.findIndex(l => l.includes('DOMICILIO'));
        if (addressIndex !== -1 && addressIndex + 1 < lines.length) {
            const potentialAddressParts = [];
            for (let i = addressIndex + 1; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('CLAVE') || line.includes('CURP') || line.includes('FOLIO') || line.match(curpRegex)) break;
                potentialAddressParts.push(line);
            }
            data.address = potentialAddressParts.join(' ');
        }

        // 5. Birth Date (Heuristic: Look for "FECHA DE NACIMIENTO")
        const birthIndex = lines.findIndex(l => l.includes('NACIMIENTO'));
        if (birthIndex !== -1 && birthIndex + 1 < lines.length) {
            const dateMatch = lines[birthIndex + 1].match(dateRegex);
            if (dateMatch) {
                // dateMatch: [original, DD, MM, YYYY]
                data.birthDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
            }
        } else {
            // Check for DOB in MRZ part if present on front
            const dobMatch = text.match(/(\d{2})(\d{2})(\d{2})\d[HM]\d{5,8}MEX/);
            if (dobMatch) {
                const year = parseInt(dobMatch[1]);
                const fullYear = year > 30 ? `19${year}` : `20${year}`;
                data.birthDate = `${fullYear}-${dobMatch[2]}-${dobMatch[3]}`;
            }
        }

        // 6. Nationality (Heuristic: Search for MEX or MEXICO)
        if (text.includes('MEX')) data.nationality = 'MEXICANA';
    }

    // --- STRATEGY: PASSPORT ---
    else if (type === 'passport') {
        // Find MRZ Lines (Long lines with <<)
        const mrzLines = lines.filter(l => l.length > 30 && (l.includes('<') || l.includes('K'))); // OCR sometimes reads < as K

        if (mrzLines.length >= 2) {
            // Sort by length or position? Usually last 2 lines.
            // Line 1 starts with P, Line 2 starts with Passport Num
            const line1 = mrzLines.find(l => l.startsWith('P') || l.startsWith('I') || l.startsWith('A')); // P=Passport
            // Line 2 starts with alphanum + date
            const line2 = mrzLines.find(l => l !== line1 && l.match(/[A-Z0-9<]{9}\d/));

            if (line1 && line2) {
                data.mrz = `${line1}\n${line2}`;

                // Parse Name from Line 1: P<MEXSURNAME<<GIVEN<NAMES<<<<<<<<
                // Remove 'P', '<', type char
                const nameSection = line1.substring(5);
                const nameParts = nameSection.split('<<');
                if (nameParts.length >= 2) {
                    const surname = nameParts[0].replace(/</g, ' ').trim();
                    const givenNames = nameParts[1].replace(/</g, ' ').trim();
                    data.name = `${givenNames} ${surname}`;
                }

                // Parse Data from Line 2
                // Format: Num(9) + Check(1) + Nation(3) + DOB(6) + Check(1) + Sex(1) + Exp(6) + Check(1)
                // OCR might mess up spacing/chars, clean it first
                const cleanL2 = line2.replace(/\s/g, '').replace(/K/g, '<');

                if (cleanL2.length >= 28) {
                    data.passportNumber = cleanL2.substring(0, 9).replace(/</g, '');
                    data.nationality = cleanL2.substring(10, 13).replace(/</g, '');

                    const dobRaw = cleanL2.substring(13, 19); // YYMMDD
                    if (!isNaN(Number(dobRaw))) {
                        // Simple century guess: if year > 30 -> 19XX, else 20XX (heuristic)
                        const year = parseInt(dobRaw.substring(0, 2));
                        const fullYear = year > 30 ? `19${year}` : `20${year}`;
                        data.birthDate = `${fullYear}-${dobRaw.substring(2, 4)}-${dobRaw.substring(4, 6)}`;
                    }

                    data.sex = cleanL2.substring(20, 21);

                    const expRaw = cleanL2.substring(21, 27); // YYMMDD
                    if (!isNaN(Number(expRaw))) {
                        const year = parseInt(expRaw.substring(0, 2));
                        // Expiration always in future/recent. Assume 20xx.
                        const fullYear = `20${year}`;
                        data.expirationDate = `${fullYear}-${expRaw.substring(2, 4)}-${expRaw.substring(4, 6)}`;
                    }
                }
            }
        }

        // Fallback: explicit labels
        if (!data.passportNumber) {
            const passIndex = lines.findIndex(l => l.includes('PASSPORT') || l.includes('PASAPORTE'));
            if (passIndex !== -1 && passIndex + 1 < lines.length) {
                const potentialNum = lines[passIndex + 1].match(/[A-Z0-9]{6,9}/);
                if (potentialNum) data.passportNumber = potentialNum[0];
            }
        }
    }

    return data;
}
