import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../core/redux/action";
import FeatherIcon from "feather-icons-react";
import { Search, XCircle } from "react-feather";
import { useTranslation } from "react-i18next";

import i18n from "../../i18n/config";
import { changeLanguage } from "../../untils/i18n";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { all_routes } from "../../Router/all_routes";

const mapProfileToHeaderUser = (profile, rolesOverride, defaultAvatar) => {
  if (!profile) {
    return null;
  }

  const first = profile.first_name || "";

  // Lấy từ đầu tiên của last_name
  const last = profile.last_name?.split(" ")?.[0] || "";

  // Gộp lại
  const computedName = `${first} ${last}`.trim();

  const fallbackName =
    profile.full_name || profile.user_name || profile.email || "";

  const avatarUrl = profile.avatar_url || defaultAvatar;

  const rolesList = Array.isArray(rolesOverride)
    ? rolesOverride
    : Array.isArray(profile.roles)
    ? profile.roles
    : [];

  const firstRole = rolesList.length > 0 ? rolesList[0] : null;

  return {
    fullName: computedName || fallbackName,
    avatarUrl,
    role: firstRole,
  };
};

const Header = () => {
  const API_URL = `${process.env.REACT_APP_API_URL}/user/profile`;
  const DEFAULT_AVATAR = "assets/img/profiles/avatar-default.png";

  const route = all_routes;
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [toggle, SetToggle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // thay doi ngon ngu
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  };

  useEffect(() => {
    try {
      const currentUserString = localStorage.getItem("currentUser");
      if (!currentUserString) {
        return;
      }
      const storedUser = JSON.parse(currentUserString);
      const preloadedUser = mapProfileToHeaderUser(
        storedUser,
        storedUser?.roles,
        DEFAULT_AVATAR
      );
      if (preloadedUser) {
        setUser(preloadedUser);
      }
    } catch (storageError) {
      console.error("Error parsing user from localStorage:", storageError);
    }
  }, [DEFAULT_AVATAR]);

  useEffect(() => {
    // Hàm gọi API lấy dữ liệu người dùng
    const fetchUserProfile = async () => {
      const userToken = localStorage.getItem("userToken");

      if (!userToken) {
        console.error("No user token found.");
        return;
      }

      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `${userToken}`,
          },
        });

        const userData = response.data.data;
        const roles = response.data.roles || [];

        const formattedUser = mapProfileToHeaderUser(
          userData,
          roles,
          DEFAULT_AVATAR
        );

        if (formattedUser) {
          setUser(formattedUser);
        }

        // === LOGIC GHI ĐÈ currentUser TRÊN localStorage
        const oldCurrentUser = JSON.parse(
          localStorage.getItem("currentUser") || "{}"
        );

        const { uuid: newUuidFromAPI, ...restUserData } = userData;
        const finalUuid = oldCurrentUser.uuid || newUuidFromAPI;

        const updatedCurrentUser = {
          ...oldCurrentUser,
          ...restUserData,
          userToken: userToken,
          roles: roles,
          uuid: finalUuid,
        };
        localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, [API_URL, DEFAULT_AVATAR]);

  useEffect(() => {
    const handleProfileUpdated = (event) => {
      const updatedProfile = event.detail?.profile;

      if (updatedProfile) {
        console.log("Header nhận được thông tin update:", updatedProfile);

        // Cập nhật state User ngay lập tức
        setUser((prevUser) => {
          if (!prevUser) return null;
          const newAvatarUrl =
            updatedProfile.avatar_url ||
            updatedProfile.avatarUrl ||
            prevUser.avatarUrl;
          const newFullName =
            `${updatedProfile.first_name} ${
              updatedProfile.last_name.split(" ")[0]
            }` ||
            updatedProfile.fullName ||
            prevUser.fullName;

          // Trả về object mới để React nhận biết state thay đổi và re-render
          return {
            ...prevUser,
            ...updatedProfile,
            avatarUrl: newAvatarUrl,
            fullName: newFullName,
          };
        });
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdated);

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, []);

  const isElementVisible = (element) => {
    return element.offsetWidth > 0 || element.offsetHeight > 0;
  };

  const slideDownSubmenu = () => {
    const subdropPlusUl = document.getElementsByClassName("subdrop");
    for (let i = 0; i < subdropPlusUl.length; i++) {
      const submenu = subdropPlusUl[i].nextElementSibling;
      if (submenu && submenu.tagName.toLowerCase() === "ul") {
        submenu.style.display = "block";
      }
    }
  };

  const slideUpSubmenu = () => {
    const subdropPlusUl = document.getElementsByClassName("subdrop");
    for (let i = 0; i < subdropPlusUl.length; i++) {
      const submenu = subdropPlusUl[i].nextElementSibling;
      if (submenu && submenu.tagName.toLowerCase() === "ul") {
        submenu.style.display = "none";
      }
    }
  };

    useEffect(() => {
    const handleMouseover = (e) => {
      e.stopPropagation();

      const body = document.body;
      const toggleBtn = document.getElementById("toggle_btn");

      if (
        body.classList.contains("mini-sidebar") &&
        isElementVisible(toggleBtn)
      ) {
        const target = e.target.closest(".sidebar, .header-left");

        if (target) {
          body.classList.add("expand-menu");
          slideDownSubmenu();
        } else {
          body.classList.remove("expand-menu");
          slideUpSubmenu();
        }

        e.preventDefault();
      }
    };

    document.addEventListener("mouseover", handleMouseover);

    return () => {
      document.removeEventListener("mouseover", handleMouseover);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  if (!user) {
    return null;
  }

  const handlesidebar = () => {
    document.body.classList.toggle("mini-sidebar");
    SetToggle((current) => !current);
  };
  const expandMenu = () => {
    document.body.classList.remove("expand-menu");
  };
  const expandMenuOpen = () => {
    document.body.classList.add("expand-menu");
  };
  const sidebarOverlay = () => {
    document?.querySelector(".main-wrapper")?.classList?.toggle("slide-nav");
    document?.querySelector(".sidebar-overlay")?.classList?.toggle("opened");
    document?.querySelector("html")?.classList?.toggle("menu-opened");
  };

  let pathname = location.pathname;

  const exclusionArray = [
    "/reactjs/template/dream-pos/index-three",
    "/reactjs/template/dream-pos/index-one",
  ];
  if (exclusionArray.indexOf(window.location.pathname) >= 0) {
    return "";
  }

  const toggleFullscreen = (elem) => {
    elem = elem || document.documentElement;
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  const userName = user.fullName;
  const userAvatar = user.avatarUrl;
  // Lấy role slug
  const userRoleSlug = user.role ? user.role.slug : "guest";

  // Vai trò hiển thị: sử dụng t() với key động
  const displayedRole = user.role ? t(`roles.${userRoleSlug}`) : "";

  return (
    <>
      <div className="header">
        {/* Logo */}
        <div
          className={`header-left ${toggle ? "" : "active"}`}
          onMouseLeave={expandMenu}
          onMouseOver={expandMenuOpen}
        >
          <Link to="/dashboard" className="logo logo-normal">
            <ImageWithBasePath src="assets/img/logo.png" alt="img" />
          </Link>
          <Link to="/dashboard" className="logo logo-white">
            <ImageWithBasePath src="assets/img/logo-white.png" alt="img" />
          </Link>
          <Link to="/dashboard" className="logo-small">
            <ImageWithBasePath src="assets/img/logo-small.png" alt="img" />
          </Link>
          <Link
            id="toggle_btn"
            to="#"
            style={{
              display: pathname.includes("tasks")
                ? "none"
                : pathname.includes("compose")
                ? "none"
                : "",
            }}
            onClick={handlesidebar}
          >
            <FeatherIcon icon="chevrons-left" className="feather-16" />
          </Link>
        </div>
        {/* /Logo */}
        <Link
          id="mobile_btn"
          className="mobile_btn"
          to="#"
          onClick={sidebarOverlay}
        >
          <span className="bar-icon">
            <span />
            <span />
            <span />
          </span>
        </Link>
        {/* Header Menu */}
        <ul className="nav user-menu">
          {/* Search */}
          <li className="nav-item nav-searchinputs">
            <div className="top-nav-search">
              <Link to="#" className="responsive-search">
                <Search />
              </Link>
              <form action="#" className="dropdown">
                <div
                  className="searchinputs dropdown-toggle"
                  id="dropdownMenuClickable"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="false"
                >
                  <input type="text" placeholder={t("header.search")} />
                  <div className="search-addon">
                    <span>
                      <XCircle className="feather-14" />
                    </span>
                  </div>
                </div>
                <div
                  className="dropdown-menu search-dropdown"
                  aria-labelledby="dropdownMenuClickable"
                >
                  <div className="search-info">
                    <h6>
                      <span>
                        <i data-feather="search" className="feather-16" />
                      </span>
                      Recent Searches
                    </h6>
                    <ul className="search-tags">
                      <li>
                        <Link to="#">Products</Link>
                      </li>
                      <li>
                        <Link to="#">Sales</Link>
                      </li>
                      <li>
                        <Link to="#">Applications</Link>
                      </li>
                    </ul>
                  </div>
                  <div className="search-info">
                    <h6>
                      <span>
                        <i data-feather="help-circle" className="feather-16" />
                      </span>
                      Help
                    </h6>
                    <p>
                      How to Change Product Volume from 0 to 200 on Inventory
                      management
                    </p>
                    <p>Change Product Name</p>
                  </div>
                  <div className="search-info">
                    <h6>
                      <span>
                        <i data-feather="user" className="feather-16" />
                      </span>
                      Customers
                    </h6>
                    <ul className="customers">
                      <li>
                        <Link to="#">
                          Aron Varu
                          <ImageWithBasePath
                            src="assets/img/profiles/avator1.jpg"
                            alt
                            className="img-fluid"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link to="#">
                          Jonita
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-01.jpg"
                            alt
                            className="img-fluid"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link to="#">
                          Aaron
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-10.jpg"
                            alt
                            className="img-fluid"
                          />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </form>
            </div>
          </li>
          {/* /Search */}

          {/* Select Store */}
          <li className="nav-item dropdown has-arrow main-drop select-store-dropdown">
            <Link
              to="#"
              className="dropdown-toggle nav-link select-store"
              data-bs-toggle="dropdown"
            >
              <span className="user-info">
                <span className="user-letter">
                  <ImageWithBasePath
                    src="assets/img/logo-small.png"
                    alt="Store Logo"
                    className="img-fluid"
                  />
                </span>
                <span className="user-detail">
                  <span className="user-name">{t("roles.salesStaff")}</span>
                </span>
              </span>
            </Link>
            <div className="dropdown-menu dropdown-menu-right">
              <Link to="#" className="dropdown-item">
                <ImageWithBasePath
                  src="assets/img/store/store-01.png"
                  alt="Store Logo"
                  className="img-fluid"
                />{" "}
                Grocery Alpha
              </Link>
              <Link to="#" className="dropdown-item">
                <ImageWithBasePath
                  src="assets/img/store/store-02.png"
                  alt="Store Logo"
                  className="img-fluid"
                />{" "}
                Grocery Apex
              </Link>
              <Link to="#" className="dropdown-item">
                <ImageWithBasePath
                  src="assets/img/store/store-03.png"
                  alt="Store Logo"
                  className="img-fluid"
                />{" "}
                Grocery Bevy
              </Link>
              <Link to="#" className="dropdown-item">
                <ImageWithBasePath
                  src="assets/img/store/store-04.png"
                  alt="Store Logo"
                  className="img-fluid"
                />{" "}
                Grocery Eden
              </Link>
            </div>
          </li>
          {/* /Select Store */}

          {/* Flag */}
          <li className="nav-item dropdown has-arrow flag-nav nav-item-box">
            <Link
              className="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              to="#"
              role="button"
            >
              <ImageWithBasePath
                src={`assets/img/flags/${
                  i18n.language === "vi" ? "vn" : "us"
                }.png`}
                alt="img"
                height={16}
              />
            </Link>
            <div className="dropdown-menu dropdown-menu-right">
              <Link
                to="#"
                className="dropdown-item"
                onClick={() => handleLanguageChange("vi")}
              >
                <ImageWithBasePath
                  src="assets/img/flags/vn.png"
                  alt="img"
                  height={16}
                />
                Việt Nam
              </Link>
              <Link
                to="#"
                className="dropdown-item"
                onClick={() => handleLanguageChange("en")}
              >
                <ImageWithBasePath
                  src="assets/img/flags/us.png"
                  alt="img"
                  height={16}
                />
                English
              </Link>
            </div>
          </li>
          {/* /Flag */}
          <li className="nav-item nav-item-box">
            <Link
              to="#"
              id="btnFullscreen"
              onClick={() => toggleFullscreen()}
              className={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
            >
              {/* <i data-feather="maximize" /> */}
              <FeatherIcon icon="maximize" />
            </Link>
          </li>
          <li className="nav-item nav-item-box">
            <Link to="/email">
              {/* <i data-feather="mail" /> */}
              <FeatherIcon icon="mail" />
              <span className="badge rounded-pill">1</span>
            </Link>
          </li>
          {/* Notifications */}
          <li className="nav-item dropdown nav-item-box">
            <Link
              to="#"
              className="dropdown-toggle nav-link"
              data-bs-toggle="dropdown"
            >
              {/* <i data-feather="bell" /> */}
              <FeatherIcon icon="bell" />
              <span className="badge rounded-pill">2</span>
            </Link>
            <div className="dropdown-menu notifications">
              <div className="topnav-dropdown-header">
                <span className="notification-title">Notifications</span>
                <Link to="#" className="clear-noti">
                  {" "}
                  Clear All{" "}
                </Link>
              </div>
              <div className="noti-content">
                <ul className="notification-list">
                  <li className="notification-message active">
                    <Link to="/activities">
                      <div className="media d-flex">
                        <span className="avatar flex-shrink-0">
                          <ImageWithBasePath
                            alt="img"
                            src="assets/img/profiles/avatar-02.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">John Doe</span> added
                            new task{" "}
                            <span className="noti-title">
                              Patient appointment booking
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              4 mins ago
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="/activities">
                      <div className="media d-flex">
                        <span className="avatar flex-shrink-0">
                          <ImageWithBasePath
                            alt="img"
                            src="assets/img/profiles/avatar-03.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">Tarah Shropshire</span>{" "}
                            changed the task name{" "}
                            <span className="noti-title">
                              Appointment booking with payment gateway
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              6 mins ago
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="/activities">
                      <div className="media d-flex">
                        <span className="avatar flex-shrink-0">
                          <ImageWithBasePath
                            alt="img"
                            src="assets/img/profiles/avatar-06.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">Misty Tison</span>{" "}
                            added{" "}
                            <span className="noti-title">Domenic Houston</span>{" "}
                            and <span className="noti-title">Claire Mapes</span>{" "}
                            to project{" "}
                            <span className="noti-title">
                              Doctor available module
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              8 mins ago
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="/activities">
                      <div className="media d-flex">
                        <span className="avatar flex-shrink-0">
                          <ImageWithBasePath
                            alt="img"
                            src="assets/img/profiles/avatar-17.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">Rolland Webber</span>{" "}
                            completed task{" "}
                            <span className="noti-title">
                              Patient and Doctor video conferencing
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              12 mins ago
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="/activities">
                      <div className="media d-flex">
                        <span className="avatar flex-shrink-0">
                          <ImageWithBasePath
                            alt="img"
                            src="assets/img/profiles/avatar-13.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">Bernardo Galaviz</span>{" "}
                            added new task{" "}
                            <span className="noti-title">
                              Private chat module
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              2 days ago
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="topnav-dropdown-footer">
                <Link to="/activities">View all Notifications</Link>
              </div>
            </div>
          </li>
          {/* /Notifications */}
          <li className="nav-item nav-item-box">
            <Link to="/general-settings">
              {/* <i data-feather="settings" /> */}
              <FeatherIcon icon="settings" />
            </Link>
          </li>
          <li className="nav-item dropdown has-arrow main-drop">
            <Link
              to="#"
              className="dropdown-toggle nav-link userset"
              data-bs-toggle="dropdown"
            >
              <span className="user-info">
                <span className="user-letter">
                  <ImageWithBasePath
                    src={userAvatar}
                    alt="img"
                    className="img-fluid"
                  />
                </span>
                <span className="user-detail">
                  <span className="user-name">{userName}</span>
                  <span className="user-role">{displayedRole}</span>
                </span>
              </span>
            </Link>
            <div className="dropdown-menu menu-drop-user">
              <div className="profilename">
                <div className="profileset">
                  <span className="user-img">
                    <ImageWithBasePath
                      src={userAvatar}
                      alt="img"
                      style="width:100%;height:100%"
                    />
                    <span className="status online" />
                  </span>
                  <div className="profilesets">
                    <h6>{userName}</h6>
                    <h5>{displayedRole}</h5>
                  </div>
                </div>
                <hr className="m-0" />
                <Link className="dropdown-item" to={route.profile}>
                  <i className="me-2" data-feather="user" />{" "}
                  {t("header.myProfile")}
                </Link>
                <Link className="dropdown-item" to={route.generalsettings}>
                  <i className="me-2" data-feather="settings" />
                  {t("header.settings")}
                </Link>
                <Link
                  className="dropdown-item logout pb-0"
                  to={route.signinthree}
                  onClick={handleLogout}
                >
                  <ImageWithBasePath
                    src="assets/img/icons/log-out.svg"
                    alt="img"
                    className="me-2"
                  />
                  {t("header.logout")}
                </Link>
              </div>
            </div>
          </li>
        </ul>
        {/* /Header Menu */}
        {/* Mobile Menu */}
        <div className="dropdown mobile-user-menu">
          <Link
            to="#"
            className="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="fa fa-ellipsis-v" />
          </Link>
          <div className="dropdown-menu dropdown-menu-right">
            <Link className="dropdown-item" to="profile">
              My Profile
            </Link>
            <Link className="dropdown-item" to={route.generalsettings}>
              Settings
            </Link>
            <div className="d-flex">
              <Link
                to="#"
                className="dropdown-item"
                onClick={() => handleLanguageChange("vi")}
              >
                <ImageWithBasePath
                  src="assets/img/flags/vn.png"
                  alt="img"
                  className={"icon-flag"}
                  height={16}
                />
              </Link>
              <Link
                to="#"
                className="dropdown-item"
                onClick={() => handleLanguageChange("en")}
              >
                <ImageWithBasePath
                  src="assets/img/flags/us.png"
                  alt="img"
                  className={"icon-flag"}
                  height={16}
                />{" "}
              </Link>
            </div>
            <Link
              className="dropdown-item"
              to={route.signinthree}
              onClick={handleLogout}
            >
              Logout
            </Link>
          </div>
        </div>
        {/* /Mobile Menu */}
      </div>
    </>
  );
};

export default Header;
