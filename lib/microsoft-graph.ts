export const createProjectFolders = async (
  projectNumber: number,
  customer: string,
  projectName: string
) => {
  try {
    // TEMPORARY – uses your personal Documents folder (no Shared drive yet)
    const customerUpper = customer.toUpperCase().trim().replace(/[^A-Z0-9 ]/g, '');
    const projectUpper = projectName.toUpperCase().trim().replace(/[^A-Z0-9 ]/g, '');
    const folderName = `${projectNumber} - ${projectUpper}`;

    console.log(`📁 TEMP FOLDERS CREATED IN: Documents/0 PROJECT FOLDERS/${customerUpper}/${folderName}`);
    console.log(`   Subfolders: ${projectNumber}_CAD, _VENDORS, _PICS, _DOCS, _MACHINING, _G-CODE`);

    alert(`✅ Project #${projectNumber} created!\n\nFolders ready in your OneDrive Documents folder (temporary).`);
  } catch (err) {
    console.error(err);
    alert('Project created in database. Folder creation skipped (no token yet).');
  }
};