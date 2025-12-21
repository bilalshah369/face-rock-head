import React, {useState} from 'react';
import OuterPackage from './OuterPackage';
import InnerPackage from './InnerPackage';
import ViewQRCodePanel from './ViewQRCodePanel';
import AdminLayout from '../AdminLayout';

const TOKEN_KEY = 'nta_token';

export default function CreatePackage({navigation}: any) {
  const [activeTab, setActiveTab] = useState<'OUTER' | 'INNER'>('OUTER');

  const [outerQr, setOuterQr] = useState<any>(null);
  const [innerQrs, setInnerQrs] = useState<any[]>([]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.clear();
    navigation.navigate('Login');
  };

  const goTo = (path: string) => navigation.navigate(path);

  return (
    <AdminLayout>
      {/* ================= TOGGLE ================= */}
      <div className="flex gap-2 mb-4">
        {(['OUTER', 'INNER'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);

              if (tab === 'OUTER') {
                if (!localStorage.getItem('tracking_id')) {
                  setOuterQr(null);
                  setInnerQrs([]);
                }
              }
            }}
            className={`
              px-3
              py-1.5
              text-sm
              rounded
              border
              transition
              ${
                activeTab === tab
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}>
            {tab} Package
          </button>
        ))}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="grid grid-cols-[420px_1fr] gap-5">
        {/* LEFT PANEL */}
        <div>
          {activeTab === 'OUTER' && (
            <OuterPackage
              onQrGenerated={setOuterQr}
              onInnerQrsLoaded={setInnerQrs}
            />
          )}

          {activeTab === 'INNER' && (
            <InnerPackage
              onParentQr={setOuterQr}
              onInnerQr={qr => setInnerQrs(prev => [...prev, qr])}
              onInnerQrsLoaded={setInnerQrs}
            />
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="sticky top-20 h-fit">
          <ViewQRCodePanel outerQr={outerQr} innerQrs={innerQrs} />
        </div>
      </div>
    </AdminLayout>
  );
}
