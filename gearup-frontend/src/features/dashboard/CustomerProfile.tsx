import { useSelector } from "react-redux";
import type { RootState } from "../../store";

export const CustomerProfile = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-ink mb-8">Profile Settings</h1>
      
      <div className="bg-base-100 p-8 rounded-xl shadow-sm border border-base-200">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-base-200">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-24">
              <span className="text-3xl font-bold">{user.name.charAt(0)}</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="form-control w-full">
            <label className="label" htmlFor="fullName">
              <span className="label-text font-semibold">Full Name</span>
            </label>
            <input id="fullName" type="text" className="input input-bordered w-full" value={user.name} readOnly title="Full Name" placeholder="Full Name" />
          </div>
          
          <div className="form-control w-full">
            <label className="label" htmlFor="emailAddress">
              <span className="label-text font-semibold">Email Address</span>
            </label>
            <input id="emailAddress" type="email" className="input input-bordered w-full" value={user.email} readOnly title="Email Address" placeholder="Email Address" />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-base-200 flex justify-end">
          <button className="btn btn-primary" disabled>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
