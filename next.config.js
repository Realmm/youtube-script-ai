/** @type {import('next').NextConfig} */
const nextConfig = {
    // async redirects() {
    //   return [
    //     {
    //       source: '/api/upload',
    //       destination: '/',
    //       permanent: true
    //     }
    //   ]
    // },
    reactStrictMode: true,
    swcMinify: true,
    env: {
        ALCHEMY_POLYGON_MAINNET_KEY: process.env.ALCHEMY_POLYGON_MAINNET_KEY
    }
}

module.exports = nextConfig
