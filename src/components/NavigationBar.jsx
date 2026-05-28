import { NavLink } from "react-router-dom";

function NavigationBar() {
  return (
    <div className="absolute inset-x-0 top-0 border-b border-[#243B27] h-[15%] bg-[#1A2E1D] flex flex-col items-center shadow-xl justify-center md:rounded-2xl">
      <div className="flex items-center justify-center gap-4">
        <h1 className="font-bold text-4xl text-[#F0FDF4]">Movie Vault</h1>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <div className="flex gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-[#4ADE80] text-[#0E1510]"
                  : "bg-transparent text-[#F0FDF4] hover:bg-[#4ADE80] hover:text-[#0E1510]"
              }`
            }
          >
            Watch List
          </NavLink>

          <NavLink
            to="/watched"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-[#4ADE80] text-[#0E1510]"
                  : "bg-transparent text-[#F0FDF4] hover:bg-[#4ADE80] hover:text-[#0E1510]"
              }`
            }
          >
            Watched List
          </NavLink>
        </div>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `p-2 rounded-lg font-medium transition-all ${
              isActive
                ? "bg-[#4ADE80] text-[#0E1510]"
                : "bg-transparent text-[#F0FDF4] hover:bg-[#4ADE80] hover:text-[#0E1510]"
            }`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </NavLink>
      </div>
    </div>
  );
}

export default NavigationBar;