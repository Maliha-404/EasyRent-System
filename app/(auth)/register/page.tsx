export default function RegisterPage() {
  return (
    <div className="min-h-screen py-24 bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-2xl font-bold mb-4">Create Account</h1>
        <p className="text-gray-500 mb-8">Join EasyRent today.</p>
        <div className="space-y-4 text-left">
          <input className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none" placeholder="Name" />
          <input className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none" placeholder="Email" />
          <input className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none" type="password" placeholder="Password" />
          <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700">Register</button>
        </div>
      </div>
    </div>
  );
}
