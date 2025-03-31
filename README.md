# WastEd Frontend

[DEMO LINK](https://youtu.be/pYFi0zbEImc)

This is the frontend for the WastEd application, which helps schools monitor and reduce food container waste by tracking takeout containers in trash bins using Raspberry Pi cameras and AI analysis.

## Features

- School registration and login
- Dashboard to view all bins
- Add new bins with Raspberry Pi IP addresses
- View real-time bin images
- Track food container scores over time
- Historical data visualization

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Backend API running (FastAPI)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file and add:

```
NEXT_PUBLIC_API_URL=http://localhost:8000  # Change to match your backend URL
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Register your school by clicking "Register School" button on the homepage
2. Log in with your credentials
3. From your school dashboard, add bins by providing the Raspberry Pi IP addresses
4. View bin details including the current image and historical data

## Backend Integration

This frontend is designed to work with the WastEd backend API, which provides:

- School registration and authentication
- Bin management
- Real-time image capture from Raspberry Pi devices
- AI-based food container counting
- Historical data tracking

## Technologies Used

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Axios for API requests

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
