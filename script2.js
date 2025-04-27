$(document).ready(function() {

const archiveAudioInput = $('#archive-audio-url');
const applyArchiveAudioBtn = $('#apply-archive-audio-btn');

applyArchiveAudioBtn.on('click', () => {
    const url = archiveAudioInput.val();
    if (url.endsWith('.mp3') || url.endsWith('.ogg')) {
        whiteNoiseSound.src = url;
        useYouTubeNoise = false; // Switch back from YouTube if previously used
        ytIframe.attr('src', ''); // Stop any YouTube noise
        ytPlayerContainer.hide();
        alert('Archive.org audio applied!');
    } else {
        alert('Please enter a valid direct .mp3 or .ogg URL from Archive.org');
    }
});


const ytNoiseUrlInput = $('#youtube-noise-url');
const applyYtNoiseBtn = $('#apply-youtube-noise-btn');
const ytIframe = $('#yt-iframe');
const ytPlayerContainer = $('#youtube-noise-player');

let useYouTubeNoise = false;

/*
// Apply YouTube white noise
applyYtNoiseBtn.on('click', () => {
    const ytUrl = ytNoiseUrlInput.val();
    const videoId = extractYouTubeID(ytUrl);
    if (videoId) {
        ytIframe.attr('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1`);
        ytPlayerContainer.show();
        useYouTubeNoise = true;
    } else {
        alert('Invalid YouTube URL');
    }
});
*/
applyYtNoiseBtn.on('click', () => {
    const ytUrl = ytNoiseUrlInput.val();
    const videoId = extractYouTubeID(ytUrl);

    if (videoId) {
        ytIframe.attr('src', `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${videoId}&mute=1&controls=0&modestbranding=1`);
        ytPlayerContainer.show();
        useYouTubeNoise = true;
    } else {
        alert('Invalid YouTube URL');
    }
});


function extractYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^?&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}


    const habitsList = $('#habits-list');
    const habitNameInput = $('#habit-name');
    const habitHoursInput = $('#habit-hours');
    const habitMinutesInput = $('#habit-minutes');
    const habitSecondsInput = $('#habit-seconds');
    const addHabitBtn = $('#add-habit-btn');
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let timerPaused = false;

    let currentTimerInterval;
    let currentlyRunningTimerHabitIndex = -1;
    
    //const whiteNoiseSound = document.getElementById('whiteNoiseSound');
    
    const archiveWhiteNoiseURL = 'https://archive.org/download/WhiteNoiseForSleep_201706/WhiteNoise.mp3';
    whiteNoiseSound.src = archiveWhiteNoiseURL;

    
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

    
    
    loadBackground(); // Load saved background on startup
    loadTextColor(); // Load saved text color on startup

    function loadHabits() {
        const storedHabits = localStorage.getItem('habits');
        return storedHabits ? JSON.parse(storedHabits) : [];
    }

    let habits = loadHabits();

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
            //const listItem = $('<li class="habit-item"></li>');
            //const listItem = $('<li class="habit-item"></li>').attr('data-index', index);
            const listItem = $('<li class="habit-item"></li>').attr('data-habit-id', habit.id);


            const habitNameDisplay = $('<span class="habit-name-display"></span>').text(habit.name);
            const habitDays = $('<div class="habit-days"></div>');
            /*const habitActions = $('<div class="habit-actions"></div>');
            */
            const habitActions = $('<div class="habit-actions" style="flex-direction: column; align-items: flex-start;"></div>');

            
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
            const streakCount = habit.progress.filter(done => done).length;
const streakDisplay = $('<div class="streak-display"></div>').text(`Streak: ${streakCount}/7`);
habitActions.append(streakDisplay);

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
            //habits.push({ name: name, duration: { hours: hours, minutes: minutes, seconds: seconds }, progress: Array(7).fill(false) });
            habits.push({
                id: Date.now(), // unique habit ID
                name: name,
                duration: { hours: hours, minutes: minutes, seconds: seconds },
                progress: Array(7).fill(false)
            });
            
            habitNameInput.val('');
            habitHoursInput.val('0');
            habitMinutesInput.val('25');
            habitSecondsInput.val('0');
            saveHabits();
            
            renderHabits();
            enableSortable();
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
        /* const startButton = habitsList.find('.habit-item').eq(habitIndex).find('.start-timer-btn');
        startButton.prop('disabled', true).text('Running...');
        */
        
        const habitItem = habitsList.find('.habit-item').eq(habitIndex);
const startButton = habitItem.find('.start-timer-btn');
startButton.hide(); // Hide Start when running

const pauseButton = $('<button class="pause-timer-btn">Pause</button>').css({ padding: '5px 10px', backgroundColor: '#ffc107', color: 'white', border: 'none', cursor: 'pointer' });
const resumeButton = $('<button class="resume-timer-btn">Resume</button>').css({ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }).hide();
startButton.after(pauseButton, resumeButton);

pauseButton.on('click', () => {
    timerPaused = true;
    clearInterval(currentTimerInterval);
    pauseButton.hide();
    resumeButton.show();
    if (!useYouTubeNoise && whiteNoiseSound) whiteNoiseSound.pause();
});

resumeButton.on('click', () => {
    timerPaused = false;
    pauseButton.show();
    resumeButton.hide();
    if (!useYouTubeNoise && whiteNoiseSound) whiteNoiseSound.play();
    startInterval(); // resume interval logic
});



        /*if (whiteNoiseSound) {
            whiteNoiseSound.currentTime = 0;
            whiteNoiseSound.play();
        }
        */
        
        if (whiteNoiseSound && !useYouTubeNoise) {
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

       /*
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
        */
        function startInterval() {
    currentTimerInterval = setInterval(() => {
        if (!timerPaused) {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(currentTimerInterval);
                timerDisplayElement.text('Done!');
                pauseButton.remove();
                resumeButton.remove();
                startButton.show().prop('disabled', false).text('Start Timer');
                markHabitAsDone(habitIndex);
                currentlyRunningTimerHabitIndex = -1;
                if (!useYouTubeNoise && beepSound) beepSound.currentTime = 0;
                if (!useYouTubeNoise && beepSound) beepSound.play();
                if (!useYouTubeNoise && whiteNoiseSound) {
                    whiteNoiseSound.pause();
                    whiteNoiseSound.currentTime = 0;
                }
            }
        }
    }, 1000);
}

startInterval(); // start immediately

        
        
    }

    function markHabitAsDone(habitIndex) {
        const dayIndex = getCurrentDayIndex();
        habits[habitIndex].progress[dayIndex] = true;
        saveHabits();
        renderHabits(); // Re-render to update the checkbox
        enableSortable();
    }

    function deleteHabit(habitIndex) {
        if (confirm('Are you sure you want to delete this habit?')) {
            habits.splice(habitIndex, 1);
            saveHabits();
            renderHabits();
            enableSortable();
        }
    }

    addHabitBtn.on('click', addHabit);
    renderHabits();
    enableSortable();
});

// Enable drag-and-drop sorting





// ⬇️ Put sortable setup right after render
$('#habits-list').sortable({
    handle: '.habit-name-display',
    update: function () {
        const newOrder = [];
        $('#habits-list .habit-item').each(function () {
            const name = $(this).find('.habit-name-display').text().trim();
            console.log("name"+ name);
            const originalHabit2 = habits.find(h => h.name === name);
            console.log("originalHabit2"+ originalHabit2);
            //const index = parseInt($(this).attr('data-index'));
            //console.log("index"+ index);
            //const originalHabit = habits[index];
                        const habitId = $(this).data('habit-id');
                        console.log("habitid"+ habitId);
                       const originalHabit = habits.find(h => h.id === habitId);
            if (originalHabit) {
                newOrder.push(originalHabit);
            }
        });
        habits = newOrder;
        saveHabits();
    }
});

function enableSortable() {
    //renderHabits();
    $('#habits-list').sortable({
        handle: '.habit-name-display',
        update: function () {
            const newOrder = [];
            $('#habits-list .habit-item').each(function () {
                const habitId = $(this).data('habit-id');
                const originalHabit = habits.find(h => h.id === habitId);
                if (originalHabit) {
                    newOrder.push(originalHabit);
                }
            });
            habits = newOrder;
            saveHabits();
        }
    });
}
