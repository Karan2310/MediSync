import React from "react";
import { NavLink } from "react-router-dom";
import "./SideNavigation.css";

const SideNavigation = () => {
  const navs = [
    {
      name: "Hospital List",
      path: "/",
      icon: "fa-solid fa-list",
    },
    {
      name: "Register",
      path: "/register",
      icon: "fa-solid fa-hospital-user",
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
    </div>
  );
};

export default SideNavigation;
