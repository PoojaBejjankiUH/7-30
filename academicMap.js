let academicMaps = {
    programs: []
}
let anyProgramsSaved = false;
const programs = [];

function displayAcademicMap() {
    const programTabs = document.getElementById('programTabs');
    const programTabsContent = document.getElementById('programTabsContent');
    programTabs.innerHTML = '';
    programTabsContent.innerHTML = '';
    programs.forEach((program, index) => {
        // Create tab
        const tab = document.createElement('li');
        tab.className = 'nav-item';
        tab.innerHTML = `
                <a class="nav-link ${index === 0 ? 'active' : ''}" id="tab-${index}" data-toggle="tab" href="#content-${index}" role="tab" aria-controls="content-${index}" aria-selected="${index === 0 ? 'true' : 'false'}">${program}</a>
            `;
        programTabs.appendChild(tab);
    
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
        tabContent.id = `content-${index}`;
        tabContent.setAttribute('role', 'tabpanel');
        tabContent.setAttribute('aria-labelledby', `tab-${index}`);
        programTabsContent.appendChild(tabContent);
    });
}

function fetchPrograms() {
    anyProgramsSaved = programs?.length ? true : false;
    if (anyProgramsSaved) {
        document.getElementById('programs-container').style.display = 'flex';
        document.getElementById('no-programs-found').style.display = 'none';
        displayAcademicMap();
    } else {
        document.getElementById('programs-container').style.display = 'none';
        document.getElementById('no-programs-found').style.display = 'flex';
    }
}

function createProgram(event) {
    if (!programs.includes(event)) {
        programs.push(event);
        academicMaps.programs.push({ name: `${event}`});
        fetchPrograms();
    }
}

fetchPrograms();

