import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const Forbidden: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-950/50 text-rose-500 border border-rose-800 shadow-lg shadow-rose-950/20 mb-6">
        <ShieldAlert size={40} className="stroke-1.5" />
      </div>
      <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Access Denied</h1>
      <p className="mt-4 max-w-md text-slate-400 text-sm leading-relaxed">
        You do not have the required permissions to view this resource. If you believe this is an error, please contact administration or sign in with a different account.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/"
          className="rounded-xl bg-slate-900 border border-white/5 px-6 py-2.5 font-display text-sm font-bold text-white transition-all hover:bg-slate-800"
        >
          Return Home
        </Link>
        <Link
          to="/login"
          className="rounded-xl bg-accentTeal px-6 py-2.5 font-display text-sm font-bold text-white transition-all hover:bg-accentTealHover shadow-lg shadow-sky-500/20"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};
export default Forbidden;
