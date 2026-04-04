
const fs = require('fs');

const path = 'c:\\Github\\Bliss\\AwakenedPath\\src\\UntetheredSoulApp.tsx';
let content = fs.readFileSync(path, 'utf8');

// I'll search for just a portion to be safe about whitespace
const startText = 'activeTab === \'home\'';
const index = content.indexOf(startText);

if (index !== -1) {
  // Let's identify the block to replace
  const startReplace = content.indexOf('<div className="lg:hidden">', index);
  const endReplace = content.indexOf('</div>', startReplace) + 6;
  
  const originalBlock = content.substring(startReplace, endReplace);
  console.log('Original Block Found:', originalBlock);
  
  const replacement = `<div className="lg:hidden">
                  <MobileDashboard
                    user={user}
                    setActiveTab={setActiveTab}
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                    isAdmin={isAdmin}
                    rotateX={rotateX}
                    rotateY={rotateY}
                    lastEntry={lastEntry}
                    onNavigateToCourse={() => setActiveTab('intelligence')}
                  />
                </div>`;
                
  content = content.substring(0, startReplace) + replacement + content.substring(endReplace);
  fs.writeFileSync(path, content);
  console.log('Successfully fixed the file.');
} else {
  console.log('Dashboard home tab not found.');
}
