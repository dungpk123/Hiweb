import React from "react";
import * as Icon from "react-feather";
import { useTranslation } from "react-i18next";

export const useSidebarData = () => {
  const { t } = useTranslation();
  const SidebarData = [
    {
      label: `${t("sidebar.main")}`,
      submenuOpen: true,
      showSubRoute: false,
      submenuHdr: "Main",
      submenuItems: [
        {
          label: `${t("sidebar.dashboard")}`,
          icon: <Icon.Grid />,
          submenu: true,
          showSubRoute: false,

          submenuItems: [
            { label: `${t("sidebar.adminDashboard")}`, link: "/" },
            {
              label: `${t("sidebar.salesDashboard")}`,
              link: "/sales-dashboard",
            },
          ],
        },
        {
          label: `${t("sidebar.application.title")}`,
          icon: <Icon.Smartphone />,
          submenu: true,
          showSubRoute: false,
          submenuItems: [
            {
              label: `${t("sidebar.application.chat")}`,
              link: "/chat",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.application.call.title")}`,
              submenu: true,
              submenuItems: [
                {
                  label: `${t("sidebar.application.call.videoCall")}`,
                  link: "/video-call",
                },
                {
                  label: `${t("sidebar.application.call.audioCall")}`,
                  link: "/audio-call",
                },
                {
                  label: `${t("sidebar.application.call.callHistory")}`,
                  link: "/call-history",
                },
              ],
            },
            {
              label: `${t("sidebar.application.calendar")}`,
              link: "/calendar",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.application.email")}`,
              link: "/email",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.application.todo")}`,
              link: "/todo",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.application.notes")}`,
              link: "/notes",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.application.fileManager")}`,
              link: "/file-manager",
              showSubRoute: false,
            },
          ],
        },
      ],
    },
    {
      label: `${t("sidebar.inventory.title")}`,
      submenuOpen: true,
      showSubRoute: false,
      submenuHdr: "Inventory",

      submenuItems: [
        {
          label: `${t("sidebar.inventory.products")}`,
          link: "/product-list",
          icon: <Icon.Box />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.inventory.createProduct")}`,
          link: "/add-product",
          icon: <Icon.PlusSquare />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.inventory.expiredProducts")}`,
          link: "/expired-products",
          icon: <Icon.Codesandbox />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.inventory.lowStocks")}`,
          link: "/low-stocks",
          icon: <Icon.TrendingDown />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.inventory.category")}`,
          link: "/category-list",
          icon: <Icon.Codepen />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.inventory.subCategory")}`,
          link: "/sub-categories",
          icon: <Icon.Speaker />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.inventory.brands")}`,
          link: "/brand-list",
          icon: <Icon.Tag />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.inventory.units")}`,
          link: "/units",
          icon: <Icon.Speaker />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.inventory.variantAttributes")}`,
          link: "/variant-attributes",
          icon: <Icon.Layers />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.inventory.warranties")}`,
          link: "/warranty",
          icon: <Icon.Bookmark />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.inventory.printBarcode")}`,
          link: "/barcode",
          icon: <Icon.AlignJustify />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.inventory.printQrCode")}`,
          link: "/qrcode",
          icon: <Icon.Maximize />,
          showSubRoute: false,
          submenu: false,
        },
      ],
    },
    {
      label: `${t("sidebar.stock.title")}`,
      submenuOpen: true,
      submenuHdr: "Stock",
      submenu: true,
      showSubRoute: false,
      submenuItems: [
        {
          label: `${t("sidebar.stock.manageStock")}`,
          link: "/manage-stocks",
          icon: <Icon.Package />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.stock.stockAdjustment")}`,
          link: "/stock-adjustment",
          icon: <Icon.Clipboard />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.stock.stockTransfer")}`,
          link: "/stock-transfer",
          icon: <Icon.Truck />,
          showSubRoute: false,
          submenu: false,
        },
      ],
    },
    {
      label: `${t("sidebar.sales.title")}`,
      submenuOpen: true,
      submenuHdr: "Sales",
      submenu: false,
      showSubRoute: false,
      submenuItems: [
        {
          label: `${t("sidebar.sales.salesList")}`,
          link: "/sales-list",
          icon: <Icon.ShoppingCart />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.sales.invoices")}`,
          link: "/invoice-report",
          icon: <Icon.FileText />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.sales.salesReturn")}`,
          link: "/sales-returns",
          icon: <Icon.Copy />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.sales.quotation")}`,
          link: "/quotation-list",
          icon: <Icon.Save />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.sales.pos")}`,
          link: "/pos",
          icon: <Icon.HardDrive />,
          showSubRoute: false,
          submenu: false,
        },
      ],
    },
    {
      label: `${t("sidebar.promo.title")}`,
      submenuOpen: true,
      submenuHdr: "Promo",
      showSubRoute: false,
      submenuItems: [
        {
          label: `${t("sidebar.promo.coupons")}`,
          link: "/coupons",
          icon: <Icon.ShoppingCart />,
          showSubRoute: false,
          submenu: false,
        },
      ],
    },
    {
      label: `${t("sidebar.purchases.title")}`,
      submenuOpen: true,
      submenuHdr: "Purchases",
      showSubRoute: false,
      submenuItems: [
        {
          label: `${t("sidebar.purchases.purchasesList")}`,
          link: "/purchase-list",
          icon: <Icon.ShoppingBag />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.purchases.purchaseOrder")}`,
          link: "/purchase-order-report",
          icon: <Icon.FileMinus />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.purchases.purchaseReturn")}`,
          link: "/purchase-returns",
          icon: <Icon.RefreshCw />,
          showSubRoute: false,
          submenu: false,
        },
      ],
    },
    {
      label: `${t("sidebar.financeAndAccounts.title")}`,
      submenuOpen: true,
      showSubRoute: false,
      submenuHdr: "Finance & Accounts",
      submenuItems: [
        {
          label: `${t("sidebar.financeAndAccounts.expenses.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.FileText />,
          submenuItems: [
            {
              label: `${t("sidebar.financeAndAccounts.expenses.expenseList")}`,
              link: "/expense-list",
              showSubRoute: false,
            },
            {
              label: `${t(
                "sidebar.financeAndAccounts.expenses.expenseCategory"
              )}`,
              link: "/expense-category",
              showSubRoute: false,
            },
          ],
        },
      ],
    },

    {
      label: `${t("sidebar.people.title")}`,
      submenuOpen: true,
      showSubRoute: false,
      submenuHdr: "People",

      submenuItems: [
        {
          label: `${t("sidebar.people.customers")}`,
          link: "/customers",
          icon: <Icon.User />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.people.suppliers")}`,
          link: "/suppliers",
          icon: <Icon.Users />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.people.stores")}`,
          link: "/store-list",
          icon: <Icon.Home />,
          showSubRoute: false,
          submenu: false,
        },
        {
          label: `${t("sidebar.people.warehouses")}`,
          link: "/warehouse",
          icon: <Icon.Archive />,
          showSubRoute: false,
          submenu: false,
        },
      ],
    },

    {
      label: `${t("sidebar.hrm.title")}`,
      submenuOpen: true,
      showSubRoute: false,
      submenuHdr: "HRM",
      submenuItems: [
        {
          label: `${t("sidebar.hrm.employees")}`,
          link: "/employees-grid",
          icon: <Icon.Users />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.hrm.departments")}`,
          link: "/department-grid",
          icon: <Icon.User />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.hrm.designations")}`,
          link: "/designation",
          icon: <Icon.UserCheck />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.hrm.shifts")}`,
          link: "/shift",
          icon: <Icon.Shuffle />,
          showSubRoute: false,
        },

        {
          label: `${t("sidebar.hrm.attendance.title")}`,
          link: "#",
          icon: <Icon.Clock />,
          showSubRoute: false,
          submenu: true,

          submenuItems: [
            {
              label: `${t("sidebar.hrm.attendance.employeeAttendance")}`,
              link: "/attendance-employee",
            },
            {
              label: `${t("sidebar.hrm.attendance.adminAttendance")}`,
              link: "/attendance-admin",
            },
          ],
        },
        {
          label: `${t("sidebar.hrm.leaves.title")}`,
          link: "#",
          icon: <Icon.Calendar />,
          showSubRoute: false,
          submenu: true,
          submenuItems: [
            {
              label: `${t("sidebar.hrm.leaves.employeeLeaves")}`,
              link: "/leaves-employee",
            },
            {
              label: `${t("sidebar.hrm.leaves.adminLeaves")}`,
              link: "/leaves-admin",
            },
            {
              label: `${t("sidebar.hrm.leaves.leaveTypes")}`,
              link: "/leave-types",
            },
          ],
        },
        {
          label: `${t("sidebar.hrm.holidays")}`,
          link: "/holidays",
          icon: <Icon.CreditCard />,
          showSubRoute: false,
        },

        {
          label: `${t("sidebar.hrm.payroll.title")}`,
          link: "#",
          icon: <Icon.DollarSign />,
          showSubRoute: false,
          submenu: true,
          submenuItems: [
            { label: `${t("sidebar.hrm.payroll.payrollList", "Payroll")}`, link: "/payroll-list" },
            { label: `${t("sidebar.hrm.payroll.payslip")}`, link: "/payslip" },
          ],
        },
      ],
    },
    {
      label: `${t("sidebar.reports.title")}`,
      submenuOpen: true,
      showSubRoute: false,
      submenuHdr: "Reports",
      submenuItems: [
        {
          label: `${t("sidebar.reports.salesReport")}`,
          link: "/sales-report",
          icon: <Icon.BarChart2 />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.reports.purchaseReport")}`,
          link: "/purchase-report",
          icon: <Icon.PieChart />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.reports.inventoryReport")}`,
          link: "/inventory-report",
          icon: <Icon.Inbox />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.reports.invoiceReport")}`,
          link: "/invoice-report",
          icon: <Icon.File />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.reports.supplierReport")}`,
          link: "/supplier-report",
          icon: <Icon.UserCheck />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.reports.customerReport")}`,
          link: "/customer-report",
          icon: <Icon.User />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.reports.expenseReport")}`,
          link: "/expense-report",
          icon: <Icon.FileText />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.reports.incomeReport")}`,
          link: "/income-report",
          icon: <Icon.BarChart />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.reports.taxReport")}`,
          link: "/tax-report",
          icon: <Icon.Database />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.reports.profitLoss")}`,
          link: "/profit-loss-report",
          icon: <Icon.TrendingDown />,
          showSubRoute: false,
        },
      ],
    },

    {
      label: `${t("sidebar.userManagement.title")}`,
      submenuOpen: true,
      showSubRoute: false,
      submenuHdr: "User Management",
      submenuItems: [
        {
          label: `${t("sidebar.userManagement.users")}`,
          link: "/users",
          icon: <Icon.UserCheck />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.userManagement.usersRoles")}`,
          link: "/users-roles",
          icon: <Icon.UserCheck />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.userManagement.rolesAndPermissions")}`,
          link: "/roles-permissions",
          icon: <Icon.UserCheck />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.userManagement.permissions")}`,
          link: "/permissions",
          icon: <Icon.UserCheck />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.userManagement.permissionsManager")}`,
          link: "/permissionsmanager",
          icon: <Icon.Key />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.userManagement.deleteAccountRequest")}`,
          link: "/delete-account",
          icon: <Icon.Lock />,
          showSubRoute: false,
        },
      ],
    },
    {
      label: `${t("sidebar.pages.title")}`,
      submenuOpen: true,
      showSubRoute: false,
      submenuHdr: "Pages",
      submenuItems: [
        {
          label: `${t("sidebar.pages.profile")}`,
          link: "/profile",
          icon: <Icon.User />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.pages.authentication.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.Shield />,
          submenuItems: [
            {
              label: `${t("sidebar.pages.authentication.login")}`,
              submenu: true,
              showSubRoute: false,
              submenuItems: [
                {
                  label: `${t("sidebar.pages.authForms.cover")}`,
                  link: "/signin",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.illustration")}`,
                  link: "/signin-2",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.basic")}`,
                  link: "/signin-3",
                  showSubRoute: false,
                },
              ],
            },
            {
              label: `${t("sidebar.pages.authentication.register")}`,
              submenu: true,
              showSubRoute: false,
              submenuItems: [
                {
                  label: `${t("sidebar.pages.authForms.cover")}`,
                  link: "/register",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.illustration")}`,
                  link: "/register-2",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.basic")}`,
                  link: "/register-3",
                  showSubRoute: false,
                },
              ],
            },
            {
              label: `${t("sidebar.pages.authentication.forgotPassword")}`,
              submenu: true,
              showSubRoute: false,
              submenuItems: [
                {
                  label: `${t("sidebar.pages.authForms.cover")}`,
                  link: "/forgot-password",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.illustration")}`,
                  link: "/forgot-password-2",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.basic")}`,
                  link: "/forgot-password-3",
                  showSubRoute: false,
                },
              ],
            },
            {
              label: `${t("sidebar.pages.authentication.resetPassword")}`,
              submenu: true,
              showSubRoute: false,
              submenuItems: [
                {
                  label: `${t("sidebar.pages.authForms.cover")}`,
                  link: "/reset-password",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.illustration")}`,
                  link: "/reset-password-2",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.basic")}`,
                  link: "/reset-password-3",
                  showSubRoute: false,
                },
              ],
            },
            {
              label: `${t("sidebar.pages.authentication.emailVerification")}`,
              submenu: true,
              showSubRoute: false,
              submenuItems: [
                {
                  label: `${t("sidebar.pages.authForms.cover")}`,
                  link: "/email-verification",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.illustration")}`,
                  link: "/email-verification-2",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.basic")}`,
                  link: "/email-verification-3",
                  showSubRoute: false,
                },
              ],
            },
            {
              label: `${t("sidebar.pages.authentication.twoStepVerification")}`,
              submenu: true,
              showSubRoute: false,
              submenuItems: [
                {
                  label: `${t("sidebar.pages.authForms.cover")}`,
                  link: "/two-step-verification",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.illustration")}`,
                  link: "/two-step-verification-2",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.pages.authForms.basic")}`,
                  link: "/two-step-verification-3",
                  showSubRoute: false,
                },
              ],
            },
            {
              label: `${t("sidebar.pages.authentication.lockScreen")}`,
              link: "/lock-screen",
              showSubRoute: false,
            },
          ],
        },
        {
          label: `${t("sidebar.pages.errorPages.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.FileMinus />,
          submenuItems: [
            {
              label: `${t("sidebar.pages.errorPages.error404")}`,
              link: "/error-404",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.pages.errorPages.error500")}`,
              link: "/error-500",
              showSubRoute: false,
            },
          ],
        },
        // {
        //   label: "Places",
        //   submenu: true,
        //   showSubRoute: false,
        //   icon: <Icon.Map />,
        //   submenuItems: [
        //     { label: "Countries", link: "countries",showSubRoute: false },
        //     { label: "States", link: "states",showSubRoute: false }
        //   ]
        // },
        {
          label: `${t("sidebar.pages.blankPage")}`,
          link: "/blank-page",
          icon: <Icon.File />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.pages.comingSoon")}`,
          link: "/coming-soon",
          icon: <Icon.Send />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.pages.underMaintenance")}`,
          link: "/under-maintenance",
          icon: <Icon.AlertTriangle />,
          showSubRoute: false,
        },
      ],
    },

    {
      label: `${t("sidebar.settings.title")}`,
      submenu: true,
      showSubRoute: false,
      submenuHdr: "Settings",
      submenuItems: [
        {
          label: `${t("sidebar.settings.generalSettings.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.Settings />,
          submenuItems: [
            {
              label: `${t("sidebar.settings.generalSettings.profile")}`,
              link: "/general-settings",
            },
            {
              label: `${t("sidebar.settings.generalSettings.security")}`,
              link: "/security-settings",
            },
            {
              label: `${t("sidebar.settings.generalSettings.notifications")}`,
              link: "/notification",
            },
            {
              label: `${t("sidebar.settings.generalSettings.connectedApps")}`,
              link: "/connected-apps",
            },
          ],
        },
        {
          label: `${t("sidebar.settings.websiteSettings.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.Globe />,
          submenuItems: [
            {
              label: `${t("sidebar.settings.websiteSettings.systemSettings")}`,
              link: "/system-settings",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.websiteSettings.companySettings")}`,
              link: "/company-settings",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.websiteSettings.localization")}`,
              link: "/localization-settings",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.websiteSettings.prefixes")}`,
              link: "/prefixes",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.websiteSettings.preference")}`,
              link: "/preference",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.websiteSettings.appearance")}`,
              link: "/appearance",
              showSubRoute: false,
            },
            {
              label: `${t(
                "sidebar.settings.websiteSettings.socialAuthentication"
              )}`,
              link: "/social-authentication",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.websiteSettings.language")}`,
              link: "/language-settings",
              showSubRoute: false,
            },
          ],
        },
        {
          label: `${t("sidebar.settings.appSettings.title")}`,
          submenu: true,

          showSubRoute: false,
          icon: <Icon.Smartphone />,
          submenuItems: [
            {
              label: `${t("sidebar.settings.appSettings.invoice")}`,
              link: "/invoice-settings",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.appSettings.printer")}`,
              link: "/printer-settings",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.appSettings.pos")}`,
              link: "/pos-settings",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.appSettings.customFields")}`,
              link: "/custom-fields",
              showSubRoute: false,
            },
          ],
        },
        {
          label: `${t("sidebar.settings.systemSettings.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.Monitor />,
          submenuItems: [
            {
              label: `${t("sidebar.settings.systemSettings.email")}`,
              link: "/email-settings",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.systemSettings.smsGateways")}`,
              link: "/sms-gateway",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.systemSettings.otp")}`,
              link: "/otp-settings",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.systemSettings.gdprCookies")}`,
              link: "/gdpr-settings",
              showSubRoute: false,
            },
          ],
        },
        {
          label: `${t("sidebar.settings.financialSettings.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.DollarSign />,
          submenuItems: [
            {
              label: `${t(
                "sidebar.settings.financialSettings.paymentGateway"
              )}`,
              link: "/payment-gateway-settings",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.financialSettings.bankAccounts")}`,
              link: "/bank-settings-grid",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.financialSettings.taxRates")}`,
              link: "/tax-rates",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.financialSettings.currencies")}`,
              link: "/currency-settings",
              showSubRoute: false,
            },
          ],
        },
        {
          label: `${t("sidebar.settings.otherSettings.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.Hexagon />,
          submenuItems: [
            {
              label: `${t("sidebar.settings.otherSettings.storage")}`,
              link: "/storage-settings",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.settings.otherSettings.banIpAddress")}`,
              link: "/ban-ip-address",
              showSubRoute: false,
            },
          ],
        },
        {
          label: `${t("sidebar.settings.logout")}`,
          link: "/signin",
          icon: <Icon.LogOut />,
          showSubRoute: false,
        },
      ],
    },
    {
      label: `${t("sidebar.uiInterface.title")}`,
      submenuOpen: true,
      showSubRoute: false,
      submenuHdr: "UI Interface",
      submenuItems: [
        {
          label: `${t("sidebar.uiInterface.baseUi.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.Layers />,
          submenuItems: [
            {
              label: `${t("sidebar.uiInterface.baseUi.alerts")}`,
              link: "/ui-alerts",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.accordion")}`,
              link: "/ui-accordion",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.avatar")}`,
              link: "/ui-avatar",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.badges")}`,
              link: "/ui-badges",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.border")}`,
              link: "/ui-borders",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.buttons")}`,
              link: "/ui-buttons",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.buttonGroup")}`,
              link: "/ui-buttons-group",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.breadcrumb")}`,
              link: "/ui-breadcrumb",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.card")}`,
              link: "/ui-cards",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.carousel")}`,
              link: "/ui-carousel",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.colors")}`,
              link: "/ui-colors",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.dropdowns")}`,
              link: "/ui-dropdowns",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.grid")}`,
              link: "/ui-grid",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.images")}`,
              link: "/ui-images",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.lightbox")}`,
              link: "/ui-lightbox",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.media")}`,
              link: "/ui-media",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.modals")}`,
              link: "/ui-modals",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.offcanvas")}`,
              link: "/ui-offcanvas",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.pagination")}`,
              link: "/ui-pagination",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.popovers")}`,
              link: "/ui-popovers",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.progress")}`,
              link: "/ui-progress",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.placeholders")}`,
              link: "/ui-placeholders",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.rangeSlider")}`,
              link: "/ui-rangeslider",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.spinner")}`,
              link: "/ui-spinner",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.sweetAlerts")}`,
              link: "/ui-sweetalerts",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.tabs")}`,
              link: "/ui-nav-tabs",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.toasts")}`,
              link: "/ui-toasts",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.tooltips")}`,
              link: "/ui-tooltips",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.typography")}`,
              link: "/ui-typography",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.baseUi.video")}`,
              link: "/ui-video",
              showSubRoute: false,
            },
          ],
        },
        {
          label: `${t("sidebar.uiInterface.advancedUi.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.Layers />,
          submenuItems: [
            {
              label: `${t("sidebar.uiInterface.advancedUi.ribbon")}`,
              link: "/ui-ribbon",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.advancedUi.clipboard")}`,
              link: "/ui-clipboard",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.advancedUi.dragAndDrop")}`,
              link: "/ui-drag-drop",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.advancedUi.rangeSlider")}`,
              link: "/ui-rangeslider",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.advancedUi.rating")}`,
              link: "/ui-rating",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.advancedUi.textEditor")}`,
              link: "/ui-text-editor",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.advancedUi.counter")}`,
              link: "/ui-counter",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.advancedUi.scrollbar")}`,
              link: "/ui-scrollbar",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.advancedUi.stickyNote")}`,
              link: "/ui-stickynote",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.advancedUi.timeline")}`,
              link: "/ui-timeline",
              showSubRoute: false,
            },
          ],
        },
        {
          label: `${t("sidebar.uiInterface.charts.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.BarChart2 />,
          submenuItems: [
            {
              label: `${t("sidebar.uiInterface.charts.apexCharts")}`,
              link: "/chart-apex",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.charts.chartJs")}`,
              link: "/chart-js",
              showSubRoute: false,
            },
          ],
        },
        {
          label: `${t("sidebar.uiInterface.icons.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.Database />,
          submenuItems: [
            {
              label: `${t("sidebar.uiInterface.icons.fontawesomeIcons")}`,
              link: "/icon-fontawesome",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.icons.featherIcons")}`,
              link: "/icon-feather",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.icons.ionicIcons")}`,
              link: "/icon-ionic",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.icons.materialIcons")}`,
              link: "/icon-material",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.icons.pe7Icons")}`,
              link: "/icon-pe7",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.icons.simplelineIcons")}`,
              link: "/icon-simpleline",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.icons.themifyIcons")}`,
              link: "/icon-themify",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.icons.weatherIcons")}`,
              link: "/icon-weather",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.icons.typiconIcons")}`,
              link: "/icon-typicon",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.uiInterface.icons.flagIcons")}`,
              link: "/icon-flag",
              showSubRoute: false,
            },
          ],
        },
        {
          label: `${t("sidebar.uiInterface.forms.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.Edit />,
          submenuItems: [
            {
              label: `${t("sidebar.uiInterface.forms.formElements.title")}`,
              submenu: true,
              showSubRoute: false,
              submenuItems: [
                {
                  label: `${t(
                    "sidebar.uiInterface.forms.formElements.basicInputs"
                  )}`,
                  link: "/form-basic-inputs",
                  showSubRoute: false,
                },
                {
                  label: `${t(
                    "sidebar.uiInterface.forms.formElements.checkboxRadios"
                  )}`,
                  link: "/form-checkbox-radios",
                  showSubRoute: false,
                },
                {
                  label: `${t(
                    "sidebar.uiInterface.forms.formElements.inputGroups"
                  )}`,
                  link: "/form-input-groups",
                  showSubRoute: false,
                },
                {
                  label: `${t(
                    "sidebar.uiInterface.forms.formElements.gridGutters"
                  )}`,
                  link: "/form-grid-gutters",
                  showSubRoute: false,
                },
                {
                  label: `${t(
                    "sidebar.uiInterface.forms.formElements.formSelect"
                  )}`,
                  link: "/form-select",
                  showSubRoute: false,
                },
                {
                  label: `${t(
                    "sidebar.uiInterface.forms.formElements.inputMasks"
                  )}`,
                  link: "/form-mask",
                  showSubRoute: false,
                },
                {
                  label: `${t(
                    "sidebar.uiInterface.forms.formElements.fileUploads"
                  )}`,
                  link: "/form-fileupload",
                  showSubRoute: false,
                },
              ],
            },
            {
              label: `${t("sidebar.uiInterface.forms.layouts.title")}`,
              submenu: true,
              showSubRoute: false,
              submenuItems: [
                {
                  label: `${t(
                    "sidebar.uiInterface.forms.layouts.horizontalForm"
                  )}`,
                  link: "/form-horizontal",
                },
                {
                  label: `${t(
                    "sidebar.uiInterface.forms.layouts.verticalForm"
                  )}`,
                  link: "/form-vertical",
                },
                {
                  label: `${t(
                    "sidebar.uiInterface.forms.layouts.floatingLabels"
                  )}`,
                  link: "/form-floating-labels",
                },
              ],
            },
            {
              label: `${t("sidebar.uiInterface.forms.formValidation")}`,
              link: "/form-validation",
            },
            {
              label: `${t("sidebar.uiInterface.forms.select2")}`,
              link: "/form-select2",
            },
            {
              label: `${t("sidebar.uiInterface.forms.formWizard")}`,
              link: "/form-wizard",
            },
          ],
        },
        {
          label: `${t("sidebar.uiInterface.tables.title")}`,
          submenu: true,
          showSubRoute: false,
          icon: <Icon.Columns />,
          submenuItems: [
            {
              label: `${t("sidebar.uiInterface.tables.basicTables")}`,
              link: "/tables-basic",
            },
            {
              label: `${t("sidebar.uiInterface.tables.dataTable")}`,
              link: "/data-tables",
            },
          ],
        },
      ],
    },
    {
      label: `${t("sidebar.help.title")}`,
      submenuOpen: true,
      showSubRoute: false,
      submenuHdr: "Help",
      submenuItems: [
        {
          label: `${t("sidebar.help.documentation")}`,
          link: "#",
          icon: <Icon.FileText />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.help.changelog")} ${t("sidebar.help.version")}`,
          link: "#",
          icon: <Icon.Lock />,
          showSubRoute: false,
        },
        {
          label: `${t("sidebar.help.multiLevel.title")}`,
          showSubRoute: false,
          submenu: true,
          icon: <Icon.FileMinus />,
          submenuItems: [
            {
              label: `${t("sidebar.help.multiLevel.level1_1")}`,
              link: "#",
              showSubRoute: false,
            },
            {
              label: `${t("sidebar.help.multiLevel.level1_2")}`,
              submenu: true,
              showSubRoute: false,
              submenuItems: [
                {
                  label: `${t("sidebar.help.multiLevel.level2_1")}`,
                  link: "#",
                  showSubRoute: false,
                },
                {
                  label: `${t("sidebar.help.multiLevel.level2_2")}`,
                  submenu: true,
                  showSubRoute: false,
                  submenuItems: [
                    {
                      label: `${t("sidebar.help.multiLevel.level3_1")}`,
                      link: "#",
                      showSubRoute: false,
                    },
                    {
                      label: `${t("sidebar.help.multiLevel.level3_2")}`,
                      link: "#",
                      showSubRoute: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  return SidebarData;
};
