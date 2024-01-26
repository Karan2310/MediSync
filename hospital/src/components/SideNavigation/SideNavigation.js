import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./SideNavigation.css";
import axios from "axios";
import { StateContext } from "../../context/StateContext.js";

const SideNavigation = () => {
  const { setIsLogin } = useContext(StateContext);
  const Navigate = useNavigate();

  const handleLogout = async () => {
    await axios.get("/api/logout");
    setIsLogin(false);
    Navigate("/login");
  };

  const navs = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "fa-solid fa-home",
    },
    {
      name: "Doctors",
      path: "/doctors",
      icon: "fa-solid fa-user-doctor",
    },
    {
      name: "Walk In Appointments",
      path: "/appointments",
      icon: "fa-solid fa-calendar-check",
    },
    {
      name: "Patients",
      path: "/patients",
      icon: "fa-solid fa-hospital-user",
    },
    {
      name: "Register Doctor",
      path: "/reg-doc",
      icon: "fa-solid fa-address-card",
    },
  ];

  return (
    <div className="navigation rounded p-3 d-flex flex-column">
      <div style={{ overflow: "auto" }}>
        {navs.map((e, index) => {
          const { name, path, icon } = e;
          return (
            <NavLink to={path} className="navlink my-2 rounded-s" key={index}>
              <i className={`me-2 ms-2 ${icon}`}></i>
              <p>{name}</p>
            </NavLink>
          );
        })}
      </div>

      <div>
        <div className="divider my-3"></div>

        <button
          className="logout-btn flexbox px-3 p-2 w-100 rounded-s"
          onClick={handleLogout}
        >
          <i className="fa-solid fa-arrow-right-from-bracket me-2 ms-2"></i>
          <p>Logout</p>
        </button>
      </div>
    </div>
  );
};

export default SideNavigation;
