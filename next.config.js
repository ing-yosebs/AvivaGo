/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'xwwejpkfvttorwizvkvj.supabase.co',
                port: '',
                pathname: '/storage/v1/**',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
            },
        ],
    },
};

module.exports = nextConfig;
