populateTables([],true);
function populateTables(courseDetails, showDeleteButtons) {
    let totalCredits = [0, 0, 0, 0];
    const semesters = ["semester1", "semester2", "semester3", "semester4", "semester5", "semester6", "semester7", "semester8"];
    const semesterNames = ["Semester 1 Fall", "Semester 2 Spring"];

    const yearsContainer = document.getElementById('years-container');
    yearsContainer.innerHTML = '';

    for (let year = 0; year < 4; year++) {
        const yearContainer = document.createElement('div');
        yearContainer.className = 'year-container';

        const yearLabel = document.createElement('div');
        yearLabel.className = 'year-label';
        yearLabel.textContent = `Year ${year + 1}`;
        yearContainer.appendChild(yearLabel);

        let semesterContainers = [];
        for (let sem = 0; sem < 2; sem++) {
            const semesterIndex = year * 2 + sem;
            const semesterContainer = document.createElement('div');
            semesterContainer.className = 'semester-container';

            const semesterHeader = document.createElement('h3');
            semesterHeader.textContent = semesterNames[sem];
            semesterContainer.appendChild(semesterHeader);

            const table = document.createElement('table');
            table.id = semesters[semesterIndex];
            if (sem === 1) {
                table.innerHTML = `<tr><th>Course Code</th><th>Course Name</th><th>Credits</th>${showDeleteButtons ? '<th>Action</th>' : ''}<th>Total</th></tr>`;
            } else {
                table.innerHTML = `<tr><th>Course Code</th><th>Course Name</th><th>Credits</th>${showDeleteButtons ? '<th>Action</th>' : ''}</tr>`;
            }
            semesterContainer.appendChild(table);

            semesterContainers.push(semesterContainer);
            yearContainer.appendChild(semesterContainer);
        }

        yearsContainer.appendChild(yearContainer);

        semesterContainers.forEach((semesterContainer, sem) => {
            const table = semesterContainer.querySelector('table');
            const semesterIndex = year * 2 + sem;
            let semesterCredits = 0;
            if(courseDetails?.length){
            Object.entries(courseDetails[semesters[semesterIndex]]).forEach(([code, course]) => {
                if (code === 'CORE') {
                    const row = createCoreCourseRow(year, sem, showDeleteButtons);
                    table.appendChild(row);
                } else {
                    const row = createCourseRow(code, course, showDeleteButtons);
                    table.appendChild(row);
                }
                semesterCredits += course.credits;
            });
        }

            totalCredits[year] += semesterCredits;

            const semesterRow = document.createElement('tr');
            const semesterHoursLabelCell = document.createElement('td');
            semesterHoursLabelCell.colSpan = 2;
            semesterHoursLabelCell.className = 'total-credits';
            semesterHoursLabelCell.textContent = `Semester ${sem + 1} Hours`;

            const semesterHoursCell = document.createElement('td');
            semesterHoursCell.className = 'total-credits semester-hours';
            semesterHoursCell.textContent = semesterCredits;

            const actionCell = document.createElement('td');
            semesterRow.appendChild(semesterHoursLabelCell);
            semesterRow.appendChild(semesterHoursCell);
            if (showDeleteButtons) semesterRow.appendChild(actionCell);

            if (sem === 1) {
                const totalCell = document.createElement('td');
                totalCell.className = 'total-credits year-total';
                totalCell.textContent = totalCredits[year];
                semesterRow.appendChild(totalCell);
            }

            table.appendChild(semesterRow);
        });

        const table1 = semesterContainers[0].querySelector('table');
        const table2 = semesterContainers[1].querySelector('table');
        const rows1 = table1.rows.length;
        const rows2 = table2.rows.length;
        const maxRows = Math.max(rows1, rows2);

        for (let i = rows1; i < maxRows; i++) {
            const emptyRow = document.createElement('tr');
            for (let j = 0; j < (showDeleteButtons ? 4 : 3); j++) {
                const emptyCell = document.createElement('td');
                emptyRow.appendChild(emptyCell);
            }
            table1.insertBefore(emptyRow, table1.lastChild);
        }

        for (let i = rows2; i < maxRows; i++) {
            const emptyRow = document.createElement('tr');
            for (let j = 0; j < (showDeleteButtons ? 5 : 4); j++) {  // Adjusted to match the columns
                const emptyCell = document.createElement('td');
                emptyRow.appendChild(emptyCell);
            }
            table2.insertBefore(emptyRow, table2.lastChild);
        }
    }

    totalCredits.forEach((credits, yearIndex) => {
       // document.getElementById(['oneCredits', 'twoCredits', 'threeCredits', 'fourCredits'][yearIndex]).textContent = `Year ${yearIndex + 1} Credits: ${credits}`;
    });
}
function getCourseDetails(){
return localStorage.getItem('courseList');
}

function getCoreCourses(){
    return localStorage.getItem('electivesList');
}
programs =[
    {
        "pid": "program1",
        "name": "Engineering",
        "years": [
            {
                "year": 1,
                "semesters": [
                    {
                        "semester": "Fall",
                        "courses": [
                            "CHEM 1111",
                            "CHEM 1311",
                            "ENGI 1100",
                            "ENGL 1301",
                            "HIST 1301",
                            "MATH 2413"
                        ]
                    },
                    {
                        "semester": "Spring",
                        "courses": [
                            "ENGI 1331",
                            "ENGL 1302",
                            "HIST 1302",
                            "MATH 2414",
                            "PHYS 2325",
                            "PHYS 2125"
                        ]
                    }
                ]
            },
            {
                "year": 2,
                "semesters": [
                    {
                        "semester": "Fall",
                        "courses": [
                            "ECE 2201",
                            "MATH 2415",
                            "MATH 3321",
                            "PHYS 2326",
                            "PHYS 2126",
                            "GOVT 2306"
                        ]
                    },
                    {
                        "semester": "Spring",
                        "courses": [
                            "ENGI 2304",
                            "ECE 2202",
                            "ECE 2100",
                            "ECE 3331",
                            "ECE 3441",
                            "CORE"
                        ]
                    }
                ]
            },
            {
                "year": 3,
                "semesters": [
                    {
                        "semester": "Fall",
                        "courses": [
                            "COSC 1437",
                            "ECE 3155",
                            "ECE 3355",
                            "ECE 3436",
                            "ECE 3337",
                            "ECE 3317"
                        ]
                    },
                    {
                        "semester": "Spring",
                        "courses": [
                            "MATH 3336",
                            "ECE 5367",
                            "ECE Elect/Lab",
                            "INDE 2333",
                            "ECON 2302"
                        ]
                    }
                ]
            },
            {
                "year": 4,
                "semesters": [
                    {
                        "semester": "Fall",
                        "courses": [
                            "COSC 2436",
                            "ECE 4335",
                            "ECE 3457",
                            "CpE Elect/Lab"
                        ]
                    },
                    {
                        "semester": "Spring",
                        "courses": [
                            "GOVT 2305",
                            "ECE 4336",
                            "CpE Elect/Lab",
                            "COSC 4351",
                            "CORE II"
                        ]
                    }
                ]
            }
        ]
    },
    
];


  function populateCourseDropdown() {
    const yearSelect = document.getElementById('year-select');
    const semesterSelect = document.getElementById('semester-select');
    const courseSelect = document.getElementById('course-select');

    const year = yearSelect.value;
    const semester = semesterSelect.value;

    if (year === "" || semester === "") {
        return;
    }

    const courseDetails = getCourseDetails();
    const semesterId = `semester${parseInt(year) * 2 + parseInt(semester) + 1}`;
    const existingCourses = courseDetails[semesterId] ? Object.keys(courseDetails[semesterId]) : [];

    courseSelect.innerHTML = '<option value="" disabled selected>Select Course</option>';
    const allCourses = Object.values(semesterCourses).reduce((acc, subs) => { return { ...acc, ...subs }; }, {});
    coreCourses.concat(Object.values(allCourses
        || {})).forEach(course => {
            if (!existingCourses.includes(course.courseCode) && course.courseCode && course.courseName) {
                const option = document.createElement('option');
                option.value = course.courseCode;
                option.textContent = `${course.courseCode} - ${course.courseName}`;
                option.dataset.courseName = course.courseName;
                option.dataset.credits = course.credits;
                option.dataset.description = course.description;
                option.dataset.lectureContactHours = course.lectureContactHours;
                option.dataset.labContactHours = course.labContactHours;
                option.dataset.prerequisite = course.prerequisite;
                option.dataset.repeatability = course.repeatability;
                option.dataset.note = course.note;
                option.dataset.tccns = course.tccns;
                option.dataset.additionalFee = course.additionalFee;
                courseSelect.appendChild(option);
            }
        });
    console.log('Course dropdown populated'); // Debug log
}


function addCourse() {
    const year = document.getElementById('year-select').value;
    const semester = document.getElementById('semester-select').value;
    const courseCode = document.getElementById('course-select').value;
    const courseDetails = getCourseDetails();
    const coreCourses = getCoreCourses();
    if (year === "" || semester === "" || courseCode === "") {
        alert("Please select all fields");
        return;
    }

    const course = coreCourses.find(c => c.courseCode === courseCode) || Object.values(semesterCourses[`semester${parseInt(year) * 2 + parseInt(semester) + 1}`] || {}).find(c => c.courseCode === courseCode);
    const semesterId = `semester${parseInt(year) * 2 + parseInt(semester) + 1}`;

    if (!courseDetails[semesterId]) {
        courseDetails[semesterId] = {};
    }

    courseDetails[semesterId][courseCode] = {
        courseName: course.courseName,
        credits: course.credits,
        description: course.description,
        lectureContactHours: course.lectureContactHours,
        labContactHours: course.labContactHours,
        prerequisite: course.prerequisite,
        repeatability: course.repeatability,
        note: course.note,
        tccns: course.tccns,
        additionalFee: course.additionalFee
    };

    saveCourseDetails(courseDetails);
    populateTables(courseDetails, isAdmin());
}

function createCourseRow(code, course, showDeleteButton) {
    const row = document.createElement('tr');
    const courseCodeCell = document.createElement('td');
    courseCodeCell.className = 'clickable';
    courseCodeCell.textContent = code;
    courseCodeCell.onclick = () => showModal(course);

    const courseNameCell = document.createElement('td');
    courseNameCell.className = 'clickable';
    courseNameCell.textContent = course.courseName;
    courseNameCell.onclick = () => showModal(course);

    const creditsCell = document.createElement('td');
    creditsCell.textContent = course.credits;

    const actionCell = document.createElement('td');
    if (showDeleteButton) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '✖'; // Cross button
        deleteButton.onclick = () => {
            deleteRow(row, code, course.credits);
        };
        actionCell.appendChild(deleteButton);

        const editButton = document.createElement('button');
        editButton.textContent = '✎'; // Edit button
        editButton.onclick = () => {
            openEditModal(code, course);
        };
        actionCell.appendChild(editButton);
    }
    row.appendChild(courseCodeCell);
    row.appendChild(courseNameCell);
    row.appendChild(creditsCell);
    if (showDeleteButton) row.appendChild(actionCell);

    return row;
}
