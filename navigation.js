document.addEventListener("DOMContentLoaded", function() {
    let courses = [];
    let electives = {};
    let semesterCourses = {}; // This can be used to store semester-specific courses if needed

    // Load courses and electives from local storage or fetch from the JSON file
    const storedCourses = localStorage.getItem('courseList');
    const storedElectives = localStorage.getItem('electivesList');
    if (storedCourses) {
        courses = JSON.parse(storedCourses);
        electives = storedElectives ? JSON.parse(storedElectives) : {};
        displayAllCourses();
        updateCategoryOptions();
    } else {
        fetch('data_version3.json')
            .then(response => response.json())
            .then(jsonData => {
                courses = jsonData.courses || [];
                electives = jsonData.electives || {};
                updateLocalStorage(); // Store the combined list initially
                displayAllCourses();
                updateCategoryOptions();
            })
            .catch(error => console.error('Error fetching courses:', error));
    }

    function updateLocalStorage() {
        localStorage.setItem('courseList', JSON.stringify(courses));
        localStorage.setItem('electivesList', JSON.stringify(electives));
    }

    // Show and hide the course form
    document.getElementById('showFormBtn').addEventListener('click', function() {
        const courseForm = document.getElementById('courseForm');
        if (courseForm.style.display === 'none' || courseForm.style.display === '') {
            courseForm.style.display = 'block';
            this.textContent = 'Hide Form';
        } else {
            courseForm.style.display = 'none';
            this.textContent = 'Add New Course';
        }
    });

    // Display all courses, including core and electives
    function displayAllCourses() {
        const courseContainer = document.querySelector("[data-yh-object='courses']");
        courseContainer.innerHTML = ''; // Clear existing content

        let allCourses = [...courses];
        for (let category in electives) {
            allCourses = [...allCourses, ...electives[category]];
        }

        allCourses.forEach((course, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" class="form-control" data-yh-field="courseCode" value="${course.courseCode}" readonly></td>
                <td><input type="text" class="form-control" data-yh-field="courseName" value="${course.courseName}"></td>
                <td><input type="text" class="form-control" data-yh-field="credits" value="${course.credits}"></td>
                <td>
                    <button type="button" class="btn btn-danger" onclick="deleteCourse(${index})">Delete</button>
                    <button type="button" class="btn btn-warning" onclick="editCourse(${index})">Edit</button>
                </td>
            `;
            courseContainer.appendChild(row);

            // Event listeners for input fields (Two-Way Binding)
            row.querySelectorAll('[data-yh-field]').forEach((input) => {
                input.addEventListener('input', (event) => {
                    const field = input.getAttribute('data-yh-field');
                    if (index < courses.length) {
                        courses[index][field] = event.target.value; // Update the data model for core courses
                    } else {
                        let electiveIndex = index - courses.length;
                        for (let category in electives) {
                            if (electiveIndex < electives[category].length) {
                                electives[category][electiveIndex][field] = event.target.value;
                                break;
                            }
                            electiveIndex -= electives[category].length;
                        }
                    }
                    updateLocalStorage();
                });
            });
        });
    }

    // Update category options for search and new course addition
    function updateCategoryOptions() {
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = `<option value="" disabled selected>Select Elective Category</option>`;
        for (let category in electives) {
            categorySelect.innerHTML += `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`;
        }
        categorySelect.innerHTML += `<option value="other">Other (Specify below)</option>`;

        const searchCategorySelect = document.getElementById('searchCategory');
        searchCategorySelect.innerHTML = `<option value="" disabled selected>Select Elective Category</option>`;
        for (let category in electives) {
            searchCategorySelect.innerHTML += `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`;
        }
    }

    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type} border-0`;
        toast.role = 'alert';
        toast.ariaLive = 'assertive';
        toast.ariaAtomic = 'true';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        toastContainer.appendChild(toast);
        new bootstrap.Toast(toast).show();
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }

    // Delete a course
    window.deleteCourse = function(index) {
        if (confirm("Are you sure you want to delete this course?")) {
            let courseToDelete = null;
            if (index < courses.length) {
                courseToDelete = courses[index];
                courses.splice(index, 1);
            } else {
                let electiveIndex = index - courses.length;
                for (let category in electives) {
                    if (electiveIndex < electives[category].length) {
                        courseToDelete = electives[category][electiveIndex];
                        electives[category].splice(electiveIndex, 1);
                        break;
                    }
                    electiveIndex -= electives[category].length;
                }
            }

            if (courseToDelete) {
                updateLocalStorage();
                displayAllCourses(); // Refresh the course list
                showToast('Course deleted successfully.', 'danger');
            }
        }
    };

    // Edit a course
    window.editCourse = function(index) {
        let course = null;
        if (index < courses.length) {
            course = courses[index];
        } else {
            let electiveIndex = index - courses.length;
            for (let category in electives) {
                if (electiveIndex < electives[category].length) {
                    course = electives[category][electiveIndex];
                    break;
                }
                electiveIndex -= electives[category].length;
            }
        }

        if (course) {
            document.getElementById('cc').value = course.courseCode || '';
            document.getElementById('cn').value = course.courseName || '';
            document.getElementById('ccre').value = course.credits || '';
            document.getElementById('des').value = course.details ? course.details.description : '';

            document.getElementById('submit').style.display = 'none';
            document.getElementById('update').style.display = 'block';

            document.getElementById('update').onclick = function() {
                updateCourse(index);
            };
        }
    };

    // Update a course
    function updateCourse(index) {
        if (validateForm()) {
            let courseData = {
                courseCode: document.getElementById('cc').value,
                courseName: document.getElementById('cn').value,
                credits: document.getElementById('ccre').value,
                details: {
                    description: document.getElementById('des').value
                }
            };

            if (index < courses.length) {
                courses[index] = courseData;
            } else {
                let electiveIndex = index - courses.length;
                for (let category in electives) {
                    if (electiveIndex < electives[category].length) {
                        electives[category][electiveIndex] = courseData;
                        break;
                    }
                }
            }

            updateLocalStorage();
            displayAllCourses(); // Refresh the course list
            document.getElementById('submit').style.display = 'block';
            document.getElementById('update').style.display = 'none';
            resetForm();
            showToast('Course updated successfully.', 'success');
        }
    }

    // Add a new course
    document.getElementById('submit').onclick = function() {
        if (validateForm()) {
            const courseType = document.getElementById('type').value;
            let category = document.getElementById('category').value;

            if (category === 'other') {
                category = document.getElementById('newCategory').value.trim();
                if (!category) {
                    showToast('Please enter a new category name.', 'warning');
                    return;
                }
                if (!electives[category]) {
                    electives[category] = [];
                }
                updateCategoryOptions(); // Update category options after adding new category
            }

            const newCourse = {
                courseCode: document.getElementById('cc').value,
                courseName: document.getElementById('cn').value,
                credits: document.getElementById('ccre').value,
                type: courseType,
                category: category,
                details: {
                    description: document.getElementById('des').value
                }
            };

            if (isDuplicateCourse(newCourse.courseCode)) {
                showToast('A course with this course code already exists.', 'warning');
                return;
            }

            if (courseType === 'core') {
                courses.push(newCourse);
            } else if (courseType === 'elective' && category) {
                if (!electives[category]) {
                    electives[category] = [];
                }
                electives[category].push(newCourse);
            }

            updateLocalStorage();
            displayAllCourses();
            resetForm(); // Reset the form after adding the course
            showToast('Course added successfully.', 'success');
        }
    };

    // Check for duplicate course codes
    function isDuplicateCourse(courseCode) {
        if (courses.some(course => course.courseCode === courseCode)) {
            return true;
        }
        for (let category in electives) {
            if (electives[category].some(course => course.courseCode === courseCode)) {
                return true;
            }
        }
        return false;
    }

    // Form validation
    function validateForm() {
        const ccode = document.getElementById("cc").value;
        const cname = document.getElementById("cn").value;
        const ccre = document.getElementById("ccre").value;
        const des = document.getElementById("des").value;

        if (ccode === "") {
            showToast("Please enter Course Code", 'warning');
            return false;
        }
        if (cname === "") {
            showToast("Please enter Course Name", 'warning');
            return false;
        }
        if (ccre === "") {
            showToast("Please enter Course Credits", 'warning');
            return false;
        } else if (ccre < 1 || ccre > 4) {
            showToast("Course credits must be between 1 and 4", 'warning');
            return false;
        }
        if (des === "") {
            showToast("Please enter Description", 'warning');
            return false;
        }
        return true;
    }

    // Toggle category fields based on course type
    document.getElementById('type').addEventListener('change', function() {
        if (this.value === 'elective') {
            document.getElementById('categoryContainer').style.display = 'block';
        } else {
            document.getElementById('categoryContainer').style.display = 'none';
            document.getElementById('newCategoryContainer').style.display = 'none';
        }
    });

    // Show new category input field if "other" is selected
    document.getElementById('category').addEventListener('change', function() {
        if (this.value === 'other') {
            document.getElementById('newCategoryContainer').style.display = 'block';
        } else {
            document.getElementById('newCategoryContainer').style.display = 'none';
        }
    });

    // Reset form fields
    function resetForm() {
        document.getElementById('cc').value = '';
        document.getElementById('cn').value = '';
        document.getElementById('ccre').value = '';
        document.getElementById('lct').value = '';
        document.getElementById('lbch').value = '';
        document.getElementById('pre').value = '';
        document.getElementById('rep').value = '';
        document.getElementById('type').value = '';
        document.getElementById('category').value = '';
        document.getElementById('newCategory').value = '';
        document.getElementById('note').value = '';
        document.getElementById('tccns').value = '';
        document.getElementById('add').value = '';
        document.getElementById('des').value = '';
        document.getElementById('categoryContainer').style.display = 'none';
        document.getElementById('newCategoryContainer').style.display = 'none';
    }

    // Filter courses based on selection
    document.getElementById('searchType').addEventListener('change', function() {
        const selectedType = this.value;
        const categoryContainer = document.getElementById('searchCategoryContainer');
        if (selectedType === 'elective') {
            categoryContainer.style.display = 'block';
        } else {
            categoryContainer.style.display = 'none';
            filterCourses(selectedType, null);
        }
    });

    document.getElementById('searchCategory').addEventListener('change', function() {
        const selectedCategory = this.value;
        filterCourses('elective', selectedCategory);
    });

    // Filter courses based on type and category
    function filterCourses(type, selectedCategory) {
        let filteredCourses = [];
        if (type === 'core') {
            filteredCourses = courses.filter(course => course.type === 'core');
        } else if (type === 'elective') {
            filteredCourses = [];
            for (let category in electives) {
                if (!selectedCategory || selectedCategory === category) {
                    filteredCourses = [...filteredCourses, ...electives[category]];
                }
            }
        } else {
            filteredCourses = [...courses, ...Object.values(electives).flat()]; // Show all if 'all' is selected
        }
        displayFilteredCourses(filteredCourses);
    }

    // Display filtered courses
    function displayFilteredCourses(filteredCourses) {
        const courseContainer = document.querySelector("[data-yh-object='courses']");
        courseContainer.innerHTML = ''; // Clear existing content
        filteredCourses.forEach((course, index) => {
            let row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" class="form-control" value="${course.courseCode}" readonly></td>
                <td><input type="text" class="form-control" value="${course.courseName}"></td>
                <td><input type="text" class="form-control" value="${course.credits}"></td>
                <td>
                    <button type="button" class="btn btn-danger" onclick="deleteCourse(${index})">Delete</button>
                    <button type="button" class="btn btn-warning" onclick="editCourse(${index})">Edit</button>
                </td>
            `;
            courseContainer.appendChild(row);
        });
    }

    // Populate course dropdown based on selected year and semester
    function populateCourseDropdown() {
        const yearSelect = document.getElementById('year-select');
        const semesterSelect = document.getElementById('semester-select');
        const courseSelect = document.getElementById('course-select');

        const year = yearSelect.value;
        const semester = semesterSelect.value;

        if (year === "" || semester === "") {
            return;
        }

        // Fetch the available courses
        const allCourses = [...courses, ...Object.values(electives).flat()];
        
        courseSelect.innerHTML = '<option value="" disabled selected>Select Course</option>';
        allCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.courseCode;
            option.textContent = `${course.courseCode} - ${course.courseName}`;
            option.dataset.courseName = course.courseName;
            option.dataset.credits = course.credits;
            courseSelect.appendChild(option);
        });
    }

    // Add course button click event
    document.getElementById('add-course-button').addEventListener('click', addCourse);

    function addCourse() {
        const year = document.getElementById('year-select').value;
        const semester = document.getElementById('semester-select').value;
        const courseCode = document.getElementById('course-select').value;
        const courseSelect = document.getElementById('course-select');

        if (year === "" || semester === "" || courseCode === "") {
            alert("Please select all fields");
            return;
        }

        // Get course details from selected option
        const selectedOption = courseSelect.options[courseSelect.selectedIndex];
        const courseName = selectedOption.dataset.courseName;
        const credits = selectedOption.dataset.credits;

        const course = {
            courseCode,
            courseName,
            credits
        };

        // Determine where to add the course based on the year and semester
        const semesterId = `semester${parseInt(year) * 2 + parseInt(semester)}`;
        
        if (!semesterCourses[semesterId]) {
            semesterCourses[semesterId] = [];
        }
        
        semesterCourses[semesterId].push(course);

        // Update local storage and UI
        updateLocalStorage();
        displayAllCourses(); // Refresh the course list

        // Optionally, you can also clear the selection
        document.getElementById('year-select').value = '';
        document.getElementById('semester-select').value = '';
        document.getElementById('course-select').value = '';
    }

    // Populate the course dropdown when year and semester are selected
    document.getElementById('year-select').addEventListener('change', populateCourseDropdown);
    document.getElementById('semester-select').addEventListener('change', populateCourseDropdown);

    // Initial population of the course dropdown
    populateCourseDropdown();
});


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
