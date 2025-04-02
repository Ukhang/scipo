import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4 text-center">404 - Page Not Found</h1>
        <p className="text-gray-300 mb-8 text-center">
          The page you are looking for does not exist.
        </p>
          <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Go to Home</Link>
      </div>
    </div>
  );
}
