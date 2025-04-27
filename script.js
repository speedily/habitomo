$(document).ready(function() {
    const habitsList = $('#habits-list');
    const habitNameInput = $('#habit-name');
    const habitHoursInput = $('#habit-hours');
    const habitMinutesInput = $('#habit-minutes');
    const habitSecondsInput = $('#habit-seconds');
    const addHabitBtn = $('#add-habit-btn');
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let currentTimerInterval;
    let currentlyRunningTimerHabitIndex = -1;
    const whiteNoiseSound = document.getElementById('whiteNoiseSound');
    const beepSound = document.getElementById('beepSound');

    // Background elements
    const bgColorTypeSelect = $('#bg-color-type');
    const solidColorPicker = $('#solid-color-picker');
    const gradientPicker = $('#gradient-picker');
    const imageUrlInput = $('#image-url-input');
    const applyBgBtn = $('#apply-bg-btn');
    const bodyElement = $('body');

    // Text color elements
    const textColorPicker = $('#text-color-picker');
    const applyTextColorBtn = $('#apply-text-color-btn');

    let habits = loadHabits();
    loadBackground(); // Load saved background on startup
    loadTextColor(); // Load saved text color on startup

    function loadHabits() {
        const storedHabits = localStorage.getItem('habits');
        return storedHabits ? JSON.parse(storedHabits) : [];
    }

    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    function loadBackground() {
        const storedBackground = localStorage.getItem('background');
        if (storedBackground) {
            bodyElement.css('background', storedBackground);
            try {
                const bgData = JSON.parse(storedBackground);
                bgColorTypeSelect.val(bgData.type);
                if (bgData.type === 'solid') {
                    $('#solid-color').val(bgData.color);
                    solidColorPicker.show();
                } else if (bgData.type === 'gradient') {
                    $('#gradient-start').val(bgData.start);
                    $('#gradient-end').val(bgData.end);
                    gradientPicker.show();
                } else if (bgData.type === 'image') {
                    $('#bg-image-url').val(bgData.url);
                    imageUrlInput.show();
                }
            } catch (e) {
                // Handle potential JSON parsing errors
            }
        }
    }

    function saveBackground(backgroundStyle) {
        localStorage.setItem('background', JSON.stringify(backgroundStyle));
    }

    function applyBackground() {
        const selectedType = bgColorTypeSelect.val();
        let backgroundValue = '';
        let backgroundData = { type: selectedType };

        if (selectedType === 'solid') {
            backgroundValue = $('#solid-color').val();
            backgroundData.color = backgroundValue;
            solidColorPicker.show();
            gradientPicker.hide();
            imageUrlInput.hide();
        } else if (selectedType === 'gradient') {
            const startColor = $('#gradient-start').val();
            const endColor = $('#gradient-end').val();
            backgroundValue = `linear-gradient(to right, ${startColor}, ${endColor})`;
            backgroundData.start = startColor;
            backgroundData.end = endColor;
            solidColorPicker.hide();
            gradientPicker.show();
            imageUrlInput.hide();
        } else if (selectedType === 'image') {
            const imageUrl = $('#bg-image-url').val();
            backgroundValue = `url('${imageUrl}')`;
            backgroundData.url = imageUrl;
            bodyElement.css('background-size', 'cover'); // Optional: cover the whole background
            solidColorPicker.hide();
            gradientPicker.hide();
            imageUrlInput.show();
        }

        bodyElement.css('background', backgroundValue);
        saveBackground(backgroundData);
    }

    /*
    bgColorTypeSelect.on('change', function() {
        const selectedType = $(this).val();
        solidColorPicker.hide();
        gradientPicker.hide();
        imageUrlInput.hide();
        if (selectedType === 'solid') {
            solidColorPicker.show();
        } else if (selectedType === 'gradient') {
            gradientPicker.show();
        } else if (selectedType === 'image') {
            imageUrlInput.show();
        }
    });
    */
    bgColorTypeSelect.on('change', function() {
        const selectedType = $(this).val();
        
        // Hide all options first
        solidColorPicker.hide();
        gradientPicker.hide();
        imageUrlInput.hide();
    
        // Show appropriate input based on selection
        if (selectedType === 'solid') {
            solidColorPicker.show();
        } else if (selectedType === 'gradient') {
            gradientPicker.show();
        } else if (selectedType === 'image') {
            imageUrlInput.show();
        }
    
        // Toggle text color input visibility
        if (selectedType === 'image') {
            $('#text-color-picker').closest('label').hide();
            $('#apply-text-color-btn').hide();
        } else {
            $('#text-color-picker').closest('label').show();
            $('#apply-text-color-btn').show();
        }
    });
    

    applyBgBtn.on('click', applyBackground);

    function loadTextColor() {
        const storedTextColor = localStorage.getItem('textColor');
        if (storedTextColor) {
            bodyElement.css('color', storedTextColor);
            textColorPicker.val(storedTextColor);
        }
    }

    function saveTextColor(color) {
        localStorage.setItem('textColor', color);
    }

    function applyTextColor() {
        const selectedColor = textColorPicker.val();
        bodyElement.css('color', selectedColor);
        saveTextColor(selectedColor);
    }

    applyTextColorBtn.on('click', applyTextColor);

    function getCurrentDayIndex() {
        const today = new Date();
        const day = today.getDay(); // 0 (Sunday) to 6 (Saturday)
        return (day === 0) ? 6 : day - 1;
    }

    function renderHabits() {
        habitsList.empty();
        habits.forEach((habit, index) => {
            const listItem = $('<li class="habit-item"></li>');
            const habitNameDisplay = $('<span class="habit-name-display"></span>').text(habit.name);
            const habitDays = $('<div class="habit-days"></div>');
            const habitActions = $('<div class="habit-actions"></div>');
            const startTimerButton = $('<button class="start-timer-btn">Start Timer</button>').on('click', () => startPomodoro(index));
            const deleteButton = $('<button class="delete-btn">Delete</button>').on('click', () => deleteHabit(index));
            const timerDisplay = $('<span class="timer-display"></span>').text('');

            daysOfWeek.forEach((day, dayIndex) => {
                const dayCheckbox = $('<div class="day-checkbox"></div>');
                const checkboxId = `habit-${index}-${dayIndex}`;
                const checkbox = $('<input type="checkbox">')
                    .attr('id', checkboxId)
                    .prop('checked', habit.progress[dayIndex] || false)
                    .prop('disabled', true); // Disable manual checking
                const label = $('<label></label').attr('for', checkboxId).text(day);
                dayCheckbox.append(checkbox, label);
                habitDays.append(dayCheckbox);
            });

            habitActions.append(startTimerButton, timerDisplay, deleteButton);
            listItem.append(habitNameDisplay, habitActions, habitDays);
            habitsList.append(listItem);
        });
    }

    function addHabit() {
        const name = habitNameInput.val().trim();
        const hours = parseInt(habitHoursInput.val()) || 0;
        const minutes = parseInt(habitMinutesInput.val()) || 0;
        const seconds = parseInt(habitSecondsInput.val()) || 0;

        if (name) {
            habits.push({ name: name, duration: { hours: hours, minutes: minutes, seconds: seconds }, progress: Array(7).fill(false) });
            habitNameInput.val('');
            habitHoursInput.val('0');
            habitMinutesInput.val('25');
            habitSecondsInput.val('0');
            saveHabits();
            renderHabits();
        }
    }

    function startPomodoro(habitIndex) {
        if (currentlyRunningTimerHabitIndex !== -1) {
            alert('Another timer is already running. Please wait for it to finish.');
            return;
        }

        currentlyRunningTimerHabitIndex = habitIndex;
        const habitDuration = habits[habitIndex].duration;
        let timeLeft = (habitDuration.hours * 3600) + (habitDuration.minutes * 60) + habitDuration.seconds;
        const timerDisplayElement = habitsList.find('.habit-item').eq(habitIndex).find('.timer-display');
        const startButton = habitsList.find('.habit-item').eq(habitIndex).find('.start-timer-btn');
        startButton.prop('disabled', true).text('Running...');

        if (whiteNoiseSound) {
            whiteNoiseSound.currentTime = 0;
            whiteNoiseSound.play();
        }

        function updateTimerDisplay() {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            timerDisplayElement.text(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }

        updateTimerDisplay();

        currentTimerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(currentTimerInterval);
                timerDisplayElement.text('Done!');
                startButton.prop('disabled', false).text('Start Timer');
                markHabitAsDone(habitIndex);
                currentlyRunningTimerHabitIndex = -1;
                if (beepSound) {
                    beepSound.currentTime = 0;
                    beepSound.play();
                }
                if (whiteNoiseSound) {
                    whiteNoiseSound.pause();
                    whiteNoiseSound.currentTime = 0;
                }
            }
        }, 1000);
    }

    function markHabitAsDone(habitIndex) {
        const dayIndex = getCurrentDayIndex();
        habits[habitIndex].progress[dayIndex] = true;
        saveHabits();
        renderHabits(); // Re-render to update the checkbox
    }

    function deleteHabit(habitIndex) {
        if (confirm('Are you sure you want to delete this habit?')) {
            habits.splice(habitIndex, 1);
            saveHabits();
            renderHabits();
        }
    }

    addHabitBtn.on('click', addHabit);
    renderHabits();
});