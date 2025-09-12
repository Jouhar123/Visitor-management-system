'use client';

import React, { useEffect, useState } from 'react';
import Navbar from './navbar/page';
import Footer from './footer/page';
import VisitorTable from '../dashboard/components/visitor_list'; 
import Sponsors from '../dashboard/components/sponsors'; 
import VisitStats from '../dashboard/components/visitorstats';
import { useRouter } from 'next/navigation';
// import {checkAuth} from '../utils/Authtoken'
import { validateUserSession } from "../utils/Authtoken";
import { UserGroupIcon, UsersIcon, ChartBarIcon, DocumentIcon } from '@heroicons/react/24/outline';


const sectionMeta = {
  dashboard: { label: 'Dashboard', icon: <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" /> },
  visitors: { label: 'Visitors', icon: <UsersIcon className="h-6 w-6 text-green-600 mr-2" /> },
  sponsors: { label: 'Sponsors', icon: <UserGroupIcon className="h-6 w-6 text-purple-600 mr-2" /> },
  reports: { label: 'Reports', icon: <DocumentIcon className="h-6 w-6 text-gray-500 mr-2" /> },
};
  
const Dashboard = () => {

  const router=useRouter();
  
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState('');


 useEffect(() => {
    async function checkUser() {
      const { valid, user } = await validateUserSession();

      if (!valid) {
        router.push("/signin");
      } else {
        setUser(user);
      }
    }

    checkUser();
  }, [router]);





  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            <div className="flex items-center justify-center mb-6">
              <ChartBarIcon className="h-8 w-8 text-blue-700 mr-2" />
              <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">Admin Dashboard</h1>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <VisitStats />
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <VisitorTable dashboardMode={true} />
              </div>
            </div>
          </>
        );
      case 'visitors':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <UsersIcon className="h-7 w-7 text-green-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">Visitors</h2>
            </div>
            <VisitorTable />
          </div>
        );
      case 'sponsors':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <UserGroupIcon className="h-7 w-7 text-purple-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">Sponsors</h2>
            </div>
            <Sponsors />
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center min-h-[200px]">
            <div className="flex items-center mb-2">
              <DocumentIcon className="h-7 w-7 text-gray-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
            </div>
            <div className="text-lg text-gray-500">Reports section coming soon...</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      {/* Navbar */}
      <div className="h-[10vh] border-b border-gray-200 bg-white shadow-sm">
        <Navbar onMenuSelect={setActiveSection} activeSection={activeSection} sectionMeta={sectionMeta} />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Footer */}
      <div className="h-[10vh] border-t border-gray-200 bg-white flex items-center justify-center">
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
