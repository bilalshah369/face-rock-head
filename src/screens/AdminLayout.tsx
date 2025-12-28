import React, {useState, useEffect, useRef} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';

/* ================== ROUTE → MENU MAP ================== */
const routeToMenuMap: Record<string, {menu: string; sub?: string}> = {
  '/': {menu: 'Dashboard'},

  '/packages/create': {menu: 'Packages', sub: 'PKG_CREATE'},
  '/packages/list': {menu: 'Packages', sub: 'PKG_QR'},
  '/packages/track': {menu: 'Packages', sub: 'PKG_TRACK'},
  '/packages/generate-qr': {menu: 'Packages', sub: 'PKG_QR'},
  '/packages/qr-list': {menu: 'Packages', sub: 'QR_GENERATE'},
  '/packages/print-qr-pdf': {menu: 'Packages', sub: 'print-qr-pdf'},
  '/packages/scan-logs': {menu: 'Scans', sub: 'SCAN_LOGS'},

  '/masters/states': {menu: 'Masters', sub: 'STATE'},
  '/masters/cities': {menu: 'Masters', sub: 'CITY'},
  '/masters/centres': {menu: 'Masters', sub: 'CENTRE'},

  '/users': {menu: 'Users', sub: 'USERS'},
  '/roles': {menu: 'Users', sub: 'ROLES'},

  '/audit': {menu: 'Audit', sub: 'AUDIT_ALL'},
};

/* ================== TYPES ================== */
interface Props {
  children: React.ReactNode;
}
const TOKEN_KEY = 'nta_token';
/* ================== COMPONENT ================== */
const AdminLayout: React.FC<Props> = ({children}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState('');
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  /* 🔑 SYNC MENU WITH URL */
  useEffect(() => {
    const match = routeToMenuMap[location.pathname];
    if (match) {
      setActiveMenu(match.menu);
      setActiveSubMenu(match.sub || '');
    }
  }, [location.pathname]);

  /* 🔑 CLOSE DROPDOWN ON OUTSIDE CLICK */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenSubMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goTo = (path: string) => {
    navigate(path);
    setOpenSubMenu(null);
  };
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.clear();
    navigate('Login');
  };
  const toggleSubMenu = (key: string) => {
    setOpenSubMenu(prev => (prev === key ? null : key));
  };

  /* ================== SUB MENU RENDER ================== */
  const renderSubMenu = (menuKey: string, items: any[]) =>
    openSubMenu === menuKey && (
      <div className="absolute top-full left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
        {items.map(item => (
          <SubMenuItem
            key={item.key}
            label={item.label}
            active={activeSubMenu === item.key}
            onMouseDown={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();

              setActiveMenu(menuKey);
              setActiveSubMenu(item.key);
              localStorage.removeItem('tracking_id');
              goTo(item.route);
            }}
          />
        ))}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ================= HEADER ================= */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <img
            src="https://package-tracking-files-prod.s3.eu-north-1.amazonaws.com/app_images/menunew.png"
            alt="NTA Logo"
            className="h-9"
          />
          <span className="text-lg font-semibold text-gray-800">NTA Admin</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={logout}
            className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded">
            Logout
          </button>
          <img
            src="https://package-tracking-files-prod.s3.eu-north-1.amazonaws.com/app_images/user_profile.png"
            alt="User"
            className="h-9 w-9 rounded-full border"
          />
        </div>
      </header>

      {/* ================= NAV ================= */}
      <nav ref={navRef} className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto flex gap-1 px-4 relative">
          {/* DASHBOARD */}
          <MenuButton
            label="Dashboard"
            active={activeMenu === 'Dashboard'}
            onClick={() => goTo('/')}
          />

          {/* PACKAGES */}
          <NavDropdown
            label="Packages"
            active={activeMenu === 'Packages'}
            open={openSubMenu === 'Packages'}
            onToggle={() => toggleSubMenu('Packages')}>
            {renderSubMenu('Packages', [
              {
                key: 'PKG_CREATE',
                label: 'Create Package QR',
                route: '/packages/create',
              },
              {
                key: 'QR_GENERATE',
                label: 'Generate QR',
                route: '/packages/qr-list',
              },
              {
                key: 'QR_PRINT_PDF',
                label: 'Print QR PDF',
                route: '/packages/print-qr-pdf',
              },
              {key: 'PKG_QR', label: 'Print QR', route: '/packages/list'},
              {
                key: 'PKG_TRACK',
                label: 'Track Packages',
                route: '/packages/track',
              },
            ])}
          </NavDropdown>

          {/* SCANS */}
          <NavDropdown
            label="Scans"
            active={activeMenu === 'Scans'}
            open={openSubMenu === 'Scans'}
            onToggle={() => toggleSubMenu('Scans')}>
            {renderSubMenu('Scans', [
              {
                key: 'SCAN_LOGS',
                label: 'Scan Logs',
                route: '/packages/scan-logs',
              },
            ])}
          </NavDropdown>

          {/* MASTERS */}
          <NavDropdown
            label="Masters"
            active={activeMenu === 'Masters'}
            open={openSubMenu === 'Masters'}
            onToggle={() => toggleSubMenu('Masters')}>
            {renderSubMenu('Masters', [
              {key: 'STATE', label: 'States', route: '/masters/states'},
              {key: 'CITY', label: 'Cities', route: '/masters/cities'},
              {key: 'CENTRE', label: 'Exam Centres', route: '/masters/centres'},
            ])}
          </NavDropdown>

          {/* USERS */}
          <NavDropdown
            label="Users & Roles"
            active={activeMenu === 'Users'}
            open={openSubMenu === 'Users'}
            onToggle={() => toggleSubMenu('Users')}>
            {renderSubMenu('Users', [
              {key: 'USERS', label: 'Users', route: '/users'},
              {key: 'ROLES', label: 'Roles', route: '/roles'},
            ])}
          </NavDropdown>

          {/* REPORTS */}
          <MenuButton
            label="Reports"
            active={activeMenu === 'Reports'}
            onClick={() => goTo('/reports')}
          />

          {/* AUDIT */}
          <NavDropdown
            label="Application Logs"
            active={activeMenu === 'Audit'}
            open={openSubMenu === 'Audit'}
            onToggle={() => toggleSubMenu('Audit')}>
            {renderSubMenu('Audit', [
              {key: 'AUDIT_ALL', label: 'All Logs', route: '/audit'},
              {
                key: 'AUDIT_PKG',
                label: 'Package Audits',
                route: '/audit?type=PACKAGE',
              },
              {
                key: 'AUDIT_SCAN',
                label: 'Scan Audits',
                route: '/audit?type=SCAN',
              },
            ])}
          </NavDropdown>
          {/* Import Export */}
          <NavDropdown
            label="Import Export"
            active={activeMenu === 'Import'}
            open={openSubMenu === 'Import'}
            onToggle={() => toggleSubMenu('Import')}>
            {renderSubMenu('Import', [
              {
                key: 'IMPORT_OUTER',
                label: 'Import Packages',
                route: '/ImportPackages',
              },
            ])}
          </NavDropdown>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
};

/* ================== UI COMPONENTS ================== */

const MenuButton = ({label, onClick, active}: any) => (
  <button
    onMouseDown={e => {
      e.preventDefault();
      onClick();
    }}
    className={`px-4 py-3 text-sm rounded-md transition ${
      active
        ? 'bg-gray-300 font-medium text-gray-900'
        : 'text-gray-700 hover:bg-gray-200'
    }`}>
    {label}
  </button>
);

const NavDropdown = ({label, active, open, onToggle, children}: any) => (
  <div className="relative">
    <MenuButton
      label={`${label} ▾`}
      active={active || open}
      onClick={onToggle}
    />
    {children}
  </div>
);

const SubMenuItem = ({label, onMouseDown, active}: any) => (
  <div
    onMouseDown={onMouseDown}
    className={`px-4 py-2 text-sm cursor-pointer select-none ${
      active ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
    }`}>
    {label}
  </div>
);

export default AdminLayout;
