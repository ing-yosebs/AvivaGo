$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
$models = @(
    "ssd_mobilenetv1_model-weights_manifest.json",
    "ssd_mobilenetv1_model-shard1",
    "ssd_mobilenetv1_model-shard2", 
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
)

$dest = "public/models"
If (!(Test-Path $dest)) { New-Item -ItemType Directory -Force -Path $dest }

foreach ($model in $models) {
    try {
        $url = "$baseUrl/$model"
        $output = "$dest/$model"
        Write-Host "Downloading $model..."
        
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($url, $output)
    }
    catch {
        Write-Host "Error downloading $model" -ForegroundColor Red
    }
}

Write-Host "Download Complete!"
