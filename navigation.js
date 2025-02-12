document.addEventListener("DOMContentLoaded", function() {
    let courses = [];
    let electives = {};
    let academicMap = { 
        0: { "semesterFall": [], "semesterSpring": [] },
        1: { "semesterFall": [], "semesterSpring": [] },
        2: { "semesterFall": [], "semesterSpring": [] },
        3: { "semesterFall": [], "semesterSpring": [] }
    };

    // Load courses and electives from local storage or fetch from the JSON file
    const storedCourses = localStorage.getItem('courseList');
    const storedElectives = localStorage.getItem('electivesList');
    const storedAcademicMap = localStorage.getItem('academicMap');
    
    if (storedCourses && storedElectives) {
        courses = JSON.parse(storedCourses);
        electives = JSON.parse(storedElectives);
        if (storedAcademicMap) academicMap = JSON.parse(storedAcademicMap);
        updateCourseDropdown();
        displayAcademicMap();
    } else {
        fetch('data_version3.json')
            .then(response => response.json())
            .then(jsonData => {
                courses = jsonData.courses || [];
                electives = jsonData.electives || {};
                updateLocalStorage(); // Store the data in local storage
                updateCourseDropdown();
                displayAcademicMap();
            })
            .catch(error => console.error('Error fetching courses:', error));
    }

    function updateLocalStorage() {
        localStorage.setItem('courseList', JSON.stringify(courses));
        localStorage.setItem('electivesList', JSON.stringify(electives));
        localStorage.setItem('academicMap', JSON.stringify(academicMap));
    }

    function updateCourseDropdown() {
        const courseSelect = document.getElementById('course-select');
        courseSelect.innerHTML = '<option value="" disabled selected>Select Course</option>';

        // Get all added courses across all years and semesters
        const addedCourses = new Set();
        for (let year in academicMap) {
            for (let semester in academicMap[year]) {
                academicMap[year][semester].forEach(courseCode => addedCourses.add(courseCode));
            }
        }

        // Populate dropdown excluding already added courses
        courses.forEach(course => {
            if (!addedCourses.has(course.courseCode)) {
                const option = document.createElement('option');
                option.value = course.courseCode;
                option.textContent = `${course.courseCode}: ${course.courseName}`;
                courseSelect.appendChild(option);
            }
        });
    }

    function displayAcademicMap() {
        const yearsContainer = document.getElementById('years-container');
        yearsContainer.innerHTML = '';

        for (let year in academicMap) {
            const yearDiv = document.createElement('div');
            yearDiv.classList.add('year-block', 'mb-5');
            yearDiv.innerHTML = `<h3>Year ${parseInt(year) + 1}</h3>`;

            const semesterContainer = document.createElement('div');
            semesterContainer.classList.add('row', 'semester-container');

            let fallCredits = 0;
            let springCredits = 0;

            for (let semester in academicMap[year]) {
                const semesterCol = document.createElement('div');
                semesterCol.classList.add('col-md-6', 'semester-block');
                semesterCol.innerHTML = `<h4>${semester === 'semesterFall' ? 'Fall' : 'Spring'}</h4>`;

                const table = document.createElement('table');
                table.classList.add('table', 'table-striped', 'table-bordered');
                const thead = document.createElement('thead');
                thead.classList.add('thead-dark');

                let headerContent;
                if (semester === 'semesterFall') {
                    headerContent = `<tr>
                        <th>Year</th>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                    </tr>`;
                } else {
                    headerContent = `<tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                        <th>Total Credits</th>
                    </tr>`;
                }
                thead.innerHTML = headerContent;
                table.appendChild(thead);

                const tbody = document.createElement('tbody');
                let semesterCredits = 0;

                academicMap[year][semester].forEach(courseCode => {
                    const course = courses.find(c => c.courseCode === courseCode);
                    if (course) {
                        const row = document.createElement('tr');
                        if (semester === 'semesterFall') {
                            row.innerHTML = `<td>${parseInt(year) + 1}</td>
                                             <td>${course.courseCode}</td>
                                             <td>${course.courseName}</td>
                                             <td>${course.credits}</td>`;
                            fallCredits += course.credits;
                        } else {
                            row.innerHTML = `<td>${course.courseCode}</td>
                                             <td>${course.courseName}</td>
                                             <td>${course.credits}</td>`;
                            springCredits += course.credits;
                        }
                        semesterCredits += course.credits;
                        tbody.appendChild(row);
                    }
                });

                // Add total credits row for individual semester
                const totalRow = document.createElement('tr');
                if (semester === 'semesterFall') {
                    totalRow.innerHTML = `<td colspan="3"><strong>Fall Total Credits</strong></td>
                                          <td><strong>${fallCredits}</strong></td>`;
                } else {
                    const totalYearCredits = fallCredits + springCredits;
                    totalRow.innerHTML = `<td colspan="2"><strong>Spring Total Credits</strong></td>
                                          <td><strong>${springCredits}</strong></td>
                                          <td><strong>${totalYearCredits}</strong></td>`;
                }
                tbody.appendChild(totalRow);

                table.appendChild(tbody);
                semesterCol.appendChild(table);
                semesterContainer.appendChild(semesterCol);
            }

            yearDiv.appendChild(semesterContainer);
            yearsContainer.appendChild(yearDiv);
        }
    }

    document.getElementById('add-course-button').addEventListener('click', addCourseToAcademicMap);

    function addCourseToAcademicMap() {
        const yearSelect = document.getElementById('year-select').value;
        const semesterSelect = document.getElementById('semester-select').value;
        const courseSelect = document.getElementById('course-select').value;

        if (yearSelect && semesterSelect && courseSelect) {
            if (!isCourseAlreadyAdded(courseSelect)) {
                academicMap[yearSelect][semesterSelect].push(courseSelect);
                updateLocalStorage();
                displayAcademicMap();
                updateCourseDropdown(); // Update dropdown after adding a course
            } else {
                alert('Course already added in the academic map.');
            }
        } else {
            alert('Please select a year, semester, and course.');
        }
    }

    function isCourseAlreadyAdded(courseCode) {
        for (let year in academicMap) {
            for (let semester in academicMap[year]) {
                if (academicMap[year][semester].includes(courseCode)) {
                    return true;
                }
            }
        }
        return false;
    }
});
