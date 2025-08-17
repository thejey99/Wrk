import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, BookOpen, Dumbbell, PlusSquare, Settings as SettingsIcon, Trash2, Copy, BarChart2, Play } from 'lucide-react';

// --- MOCK DATA (to be replaced with Firestore) ---
const MOCK_PROGRAMS = [
  {
    id: 'prog1',
    name: 'GZCLP',
    author: 'Cody LeFever',
    description: 'A 4-day linear progression program for beginners and intermediates focusing on compound lifts.',
    isPublic: true,
    weeks: [
      {
        id: 'week1',
        name: 'Week 1',
        days: [
          {
            id: 'day1',
            name: 'Day 1: T1 Squat, T2 Bench',
            exercises: [
              { id: 'ex1', name: 'Squat', sets: [{reps: '5', intensity: 'RPE 8-9', weight: '185 lbs'}, {reps: '5', intensity: 'RPE 8-9', weight: '185 lbs'}, {reps: '5', intensity: 'RPE 8-9', weight: '185 lbs'}] },
              { id: 'ex2', name: 'Bench Press', sets: [{reps: '8', intensity: 'RPE 7', weight: '135 lbs'}, {reps: '8', intensity: 'RPE 7', weight: '135 lbs'}, {reps: '8', intensity: 'RPE 7', weight: '135 lbs'}, {reps: '8', intensity: 'RPE 7', weight: '135 lbs'}] },
              { id: 'ex3', name: 'Lat Pulldown', sets: [{reps: '10-12', intensity: 'RPE 7-8', weight: ''}, {reps: '10-12', intensity: 'RPE 7-8', weight: ''}, {reps: '10-12', intensity: 'RPE 7-8', weight: ''}] },
            ],
          },
          {
            id: 'day2',
            name: 'Day 2: T1 OHP, T2 Deadlift',
            exercises: [
              { id: 'ex4', name: 'Overhead Press', sets: [{reps: '5', intensity: 'RPE 8-9', weight: '95 lbs'}, {reps: '5', intensity: 'RPE 8-9', weight: '95 lbs'}, {reps: '5', intensity: 'RPE 8-9', weight: '95 lbs'}] },
              { id: 'ex5', name: 'Deadlift', sets: [{reps: '8', intensity: 'RPE 7', weight: '225 lbs'}, {reps: '8', intensity: 'RPE 7', weight: '225 lbs'}, {reps: '8', intensity: 'RPE 7', weight: '225 lbs'}, {reps: '8', intensity: 'RPE 7', weight: '225 lbs'}] },
              { id: 'ex6', name: 'Dumbbell Row', sets: [{reps: '10-12', intensity: 'RPE 7-8', weight: ''}, {reps: '10-12', intensity: 'RPE 7-8', weight: ''}, {reps: '10-12', intensity: 'RPE 7-8', weight: ''}] },
            ],
          },
        ]
      }
    ],
  },
];

// --- Main App Component ---
const App = () => {
    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState('Programs');
    const [theme, setTheme] = useState('light');
    const [allPrograms, setAllPrograms] = useState(MOCK_PROGRAMS);
    const [selectedPrograms, setSelectedPrograms] = useState([]);
    const [activeProgram, setActiveProgram] = useState(null); 
    const [currentWorkoutDayIndex, setCurrentWorkoutDayIndex] = useState(0);
    const [workoutHistory, setWorkoutHistory] = useState({});
    const [historyModalExercise, setHistoryModalExercise] = useState(null);

    // --- EFFECTS ---
    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    // --- HANDLERS ---
    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    const handleSelectProgram = (program) => {
        if (!selectedPrograms.find(p => p.id === program.id)) {
            setSelectedPrograms([...selectedPrograms, program]);
        }
        setActiveProgram(program);
        setCurrentWorkoutDayIndex(0);
        setActiveTab('Workout');
    };
    
    const handleCreateProgram = (newProgram) => {
        const programWithId = { ...newProgram, id: `prog_${Date.now()}`, author: 'You' };
        setAllPrograms([...allPrograms, programWithId]);
        setSelectedPrograms([...selectedPrograms, programWithId]);
        setActiveProgram(programWithId);
        setActiveTab('Programs');
    };

    const handleFinishWorkout = (completedWorkout) => {
        const newHistory = { ...workoutHistory };
        const workoutDate = new Date();

        completedWorkout.exercises.forEach(exercise => {
            const exerciseName = exercise.name;
            if (!newHistory[exerciseName]) newHistory[exerciseName] = [];
            
            const loggedSets = completedWorkout.logs[exercise.id]
                .filter(log => log.reps && log.weight)
                .map(log => ({ reps: parseInt(log.reps), weight: parseInt(log.weight) }));

            if (loggedSets.length > 0) {
                 newHistory[exerciseName].unshift({ date: workoutDate, sets: loggedSets });
            }
        });

        setWorkoutHistory(newHistory);
        
        const allDays = activeProgram.weeks.flatMap(w => w.days);
        setCurrentWorkoutDayIndex((prevIndex) => (prevIndex + 1) % allDays.length);
    };

    const handleSetActiveProgram = (program) => {
        setActiveProgram(program);
        setCurrentWorkoutDayIndex(0);
    };

    const closeHistoryModal = () => setHistoryModalExercise(null);

    // --- RENDER LOGIC ---
    const renderContent = () => {
        switch (activeTab) {
            case 'Settings':
                return <SettingsScreen theme={theme} toggleTheme={toggleTheme} />;
            case 'Programs':
                return <ProgramsScreen allPrograms={allPrograms} selectedPrograms={selectedPrograms} onSelectProgram={handleSelectProgram} onSetActive={handleSetActiveProgram} activeProgramId={activeProgram?.id} setActiveTab={setActiveTab} />;
            case 'Workout':
                return <WorkoutScreen activeProgram={activeProgram} dayIndex={currentWorkoutDayIndex} onExerciseClick={setHistoryModalExercise} onFinishWorkout={handleFinishWorkout} workoutHistory={workoutHistory} />;
            case 'Create':
                return <CreateScreen onCreateProgram={handleCreateProgram} />;
            default:
                return <ProgramsScreen />;
        }
    };

    return (
        <div className="h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
            <main className="flex-1 overflow-y-auto pb-20">
                {renderContent()}
            </main>
            {historyModalExercise && <ExerciseHistoryModal exerciseName={historyModalExercise} history={workoutHistory[historyModalExercise] || []} onClose={closeHistoryModal} />}
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
};

// --- All other components ---
const SettingsScreen = ({ theme, toggleTheme }) => (
    <div className="p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md mx-auto">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Theme</span>
                <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                </button>
            </div>
        </div>
    </div>
);

const ProgramsScreen = ({ allPrograms, selectedPrograms, onSelectProgram, onSetActive, activeProgramId, setActiveTab }) => {
    const [activeSubTab, setActiveSubTab] = useState('Discover');
    const discoverPrograms = allPrograms.filter(p => p.isPublic);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Programs</h1>
            <div className="flex justify-center mb-6 border-b border-gray-300 dark:border-gray-700">
                <button onClick={() => setActiveSubTab('Discover')} className={`px-6 py-2 font-semibold transition-colors ${activeSubTab === 'Discover' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}>Discover</button>
                <button onClick={() => setActiveSubTab('Selected')} className={`px-6 py-2 font-semibold transition-colors ${activeSubTab === 'Selected' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}>My Programs</button>
            </div>
            <div className="space-y-4">
                {activeSubTab === 'Discover' && discoverPrograms.map(program => (
                    <ProgramCard key={program.id} program={program}>
                        <button onClick={() => onSelectProgram(program)} className="w-full mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Add to My Programs</button>
                    </ProgramCard>
                ))}
                {activeSubTab === 'Selected' && (
                    selectedPrograms.length > 0 ? selectedPrograms.map(program => (
                       <ProgramCard key={program.id} program={program}>
                            <div className="flex space-x-2 mt-4">
                                 <button onClick={() => onSetActive(program)} className={`w-full font-bold py-2 px-4 rounded-lg transition-colors ${activeProgramId === program.id ? 'bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}>{activeProgramId === program.id ? 'Active' : 'Set Active'}</button>
                                 <button onClick={() => setActiveTab('Workout')} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={activeProgramId !== program.id}>Go to Workout</button>
                            </div>
                       </ProgramCard>
                    )) : <div className="text-center text-gray-500 dark:text-gray-400 py-10"><p>You haven't selected any programs yet.</p><p>Go to the "Discover" tab to find one!</p></div>
                )}
            </div>
        </div>
    );
};

const WorkoutScreen = ({ activeProgram, dayIndex, onExerciseClick, onFinishWorkout, workoutHistory }) => {
    const [activeSubTab, setActiveSubTab] = useState('Today\'s Workout');
    const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
    const [workoutLogs, setWorkoutLogs] = useState({});

    const allDays = useMemo(() => {
        if (!activeProgram || !activeProgram.weeks) return [];
        return activeProgram.weeks.flatMap(week => week.days.map(day => ({...day, weekName: week.name})));
    }, [activeProgram]);

    const currentDay = allDays[dayIndex];
    
    useEffect(() => {
        setIsWorkoutStarted(false);
        if (currentDay) {
            const initialLogs = {};
            currentDay.exercises.forEach(ex => {
                initialLogs[ex.id] = ex.sets.map(() => ({ reps: '', weight: '', completed: false }));
            });
            setWorkoutLogs(initialLogs);
        }
    }, [currentDay]);

    if (!activeProgram) return <div className="p-4 text-center"><h1 className="text-3xl font-bold mb-4">Workout</h1><p className="text-gray-500 dark:text-gray-400">No active program selected.</p><p className="text-gray-500 dark:text-gray-400">Go to "Programs" to select one.</p></div>;
    if (allDays.length === 0) return <div className="p-4 text-center"><h1 className="text-3xl font-bold mb-4">{activeProgram.name}</h1><p className="text-gray-500 dark:text-gray-400">This program has no workout days.</p></div>;

    const handleLogChange = (exerciseId, setIndex, field, value) => {
        const newLogs = { ...workoutLogs };
        newLogs[exerciseId][setIndex][field] = value;
        setWorkoutLogs(newLogs);
    };
    
    const handleFinishClick = () => {
        onFinishWorkout({ exercises: currentDay.exercises, logs: workoutLogs });
        setIsWorkoutStarted(false);
    };

    const renderWorkoutContent = () => {
        if (isWorkoutStarted) {
            return (
                <div className="space-y-4">
                    {currentDay.exercises.map(exercise => (
                        <ExerciseCard key={exercise.id} exercise={exercise} onExerciseClick={onExerciseClick} loggedSets={workoutLogs[exercise.id]} onLogChange={(setIndex, field, value) => handleLogChange(exercise.id, setIndex, field, value)} />
                    ))}
                    <button onClick={handleFinishClick} className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">Finish Workout</button>
                </div>
            );
        }
        return <WorkoutPreviewCard day={currentDay} onStart={() => setIsWorkoutStarted(true)} />;
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-center mb-4">{activeProgram.name}</h1>
            <div className="flex justify-center mb-6 border-b border-gray-300 dark:border-gray-700">
                <button onClick={() => setActiveSubTab('Today\'s Workout')} className={`px-6 py-2 font-semibold transition-colors ${activeSubTab === 'Today\'s Workout' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}>Today's Workout</button>
                <button onClick={() => setActiveSubTab('Analytics')} className={`px-6 py-2 font-semibold transition-colors ${activeSubTab === 'Analytics' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}>Analytics</button>
            </div>
            {activeSubTab === 'Today\'s Workout' && renderWorkoutContent()}
            {activeSubTab === 'Analytics' && <AnalyticsScreen workoutHistory={workoutHistory} />}
        </div>
    );
};

const AnalyticsScreen = ({ workoutHistory }) => {
    const weeklyStats = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        let totalVolume = 0;
        const workoutDates = new Set();

        Object.values(workoutHistory).forEach(exerciseSessions => {
            exerciseSessions.forEach(session => {
                if (session.date >= startOfWeek) {
                    workoutDates.add(session.date.toDateString());
                    session.sets.forEach(set => {
                        const weight = set.weight || 0;
                        const reps = set.reps || 0;
                        totalVolume += weight * reps;
                    });
                }
            });
        });
        
        const workoutsThisWeek = workoutDates.size;
        return { workoutsThisWeek, totalVolume };
    }, [workoutHistory]);

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Workouts This Week</h3>
                <p className="text-3xl font-bold">{weeklyStats.workoutsThisWeek}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Volume (Week)</h3>
                <p className="text-3xl font-bold">{weeklyStats.totalVolume.toLocaleString()} lbs</p>
            </div>
        </div>
    );
};

const WorkoutPreviewCard = ({ day, onStart }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400 mb-1">{day.weekName}</h2>
        <h3 className="text-2xl font-bold text-center mb-4">{day.name}</h3>
        <ul className="space-y-2 mb-6">
            {day.exercises.map(ex => (
                <li key={ex.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                    <span className="font-semibold">{ex.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{ex.sets.length} sets</span>
                </li>
            ))}
        </ul>
        <button onClick={onStart} className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            <Play size={20} />
            <span>Start Workout</span>
        </button>
    </div>
);

const CreateScreen = ({ onCreateProgram }) => {
    const [programName, setProgramName] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [weeks, setWeeks] = useState([{ id: Date.now(), name: 'Week 1', days: [] }]);
    const [activeWeekIndex, setActiveWeekIndex] = useState(0);

    const handleAddWeek = () => {
        const newWeek = { id: Date.now(), name: `Week ${weeks.length + 1}`, days: [] };
        setWeeks([...weeks, newWeek]);
        setActiveWeekIndex(weeks.length);
    };
    
    const handleCopyPreviousWeek = (targetWeekIndex) => {
        if (targetWeekIndex === 0) return;
        const sourceWeek = weeks[targetWeekIndex - 1];
        
        const copiedDays = sourceWeek.days.map(day => ({
            ...day, id: Date.now() + Math.random(),
            exercises: day.exercises.map(ex => ({
                ...ex, id: Date.now() + Math.random(),
                sets: ex.sets.map(set => ({ ...set, id: Date.now() + Math.random() }))
            }))
        }));

        const newWeeks = [...weeks];
        newWeeks[targetWeekIndex].days = copiedDays;
        setWeeks(newWeeks);
    };

    const handleAddDay = (weekIndex) => {
        const newDay = { id: Date.now(), name: `Day ${weeks[weekIndex].days.length + 1}`, exercises: [] };
        const newWeeks = [...weeks];
        newWeeks[weekIndex].days.push(newDay);
        setWeeks(newWeeks);
    };

    const handleDayNameChange = (weekIndex, dayId, newName) => {
        const newWeeks = [...weeks];
        newWeeks[weekIndex].days = newWeeks[weekIndex].days.map(day => day.id === dayId ? { ...day, name: newName } : day);
        setWeeks(newWeeks);
    };

    const handleAddExercise = (weekIndex, dayId) => {
        const newExercise = { id: Date.now(), name: '', sets: [{ id: Date.now(), reps: '', intensity: '', weight: '' }] };
        const newWeeks = [...weeks];
        newWeeks[weekIndex].days = newWeeks[weekIndex].days.map(day => day.id === dayId ? { ...day, exercises: [...day.exercises, newExercise] } : day);
        setWeeks(newWeeks);
    };

    const handleExerciseChange = (weekIndex, dayId, exerciseId, field, value) => {
        const newWeeks = [...weeks];
        newWeeks[weekIndex].days = newWeeks[weekIndex].days.map(day => day.id === dayId ? { ...day, exercises: day.exercises.map(ex => ex.id === exerciseId ? { ...ex, [field]: value } : ex) } : day);
        setWeeks(newWeeks);
    };
    
    const handleRemoveExercise = (weekIndex, dayId, exerciseId) => {
        const newWeeks = [...weeks];
        newWeeks[weekIndex].days = newWeeks[weekIndex].days.map(day => day.id === dayId ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) } : day);
        setWeeks(newWeeks);
    };

    const handleAddSet = (weekIndex, dayId, exerciseId) => {
        const newSet = { id: Date.now(), reps: '', intensity: '', weight: '' };
        const newWeeks = [...weeks];
        newWeeks[weekIndex].days = newWeeks[weekIndex].days.map(day => day.id === dayId ? { ...day, exercises: day.exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex) } : day);
        setWeeks(newWeeks);
    };

    const handleSetChange = (weekIndex, dayId, exerciseId, setId, field, value) => {
        const newWeeks = [...weeks];
        newWeeks[weekIndex].days = newWeeks[weekIndex].days.map(day => day.id === dayId ? { ...day, exercises: day.exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.map(set => set.id === setId ? { ...set, [field]: value } : set) } : ex) } : day);
        setWeeks(newWeeks);
    };

    const handleRemoveSet = (weekIndex, dayId, exerciseId, setId) => {
        const newWeeks = [...weeks];
        newWeeks[weekIndex].days = newWeeks[weekIndex].days.map(day => day.id === dayId ? { ...day, exercises: day.exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) } : ex) } : day);
        setWeeks(newWeeks);
    };

    const handleSaveProgram = () => {
        if (!programName.trim()) { alert('Please enter a program name.'); return; }
        const nonEmptyWeeks = weeks.filter(week => week.days.some(day => day.exercises.length > 0));
        if (nonEmptyWeeks.length === 0) { alert('Please add at least one exercise to your program before saving.'); return; }
        const isValid = nonEmptyWeeks.every(week => week.days.every(day => day.exercises.every(ex => ex.name.trim() && ex.sets.length > 0 && ex.sets.every(set => set.reps.trim()))));
        if (!isValid) { alert('Please fill out all exercise names and rep targets for each set.'); return; }
        const finalProgram = { name: programName, description: 'A custom program.', weeks: nonEmptyWeeks, isPublic };
        onCreateProgram(finalProgram);
        setProgramName('');
        setIsPublic(false);
        setWeeks([{ id: Date.now(), name: 'Week 1', days: [] }]);
        setActiveWeekIndex(0);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Create Program</h1>
            <div className="space-y-6 max-w-2xl mx-auto">
                <input type="text" placeholder="Program Name (e.g., My PPL Split)" value={programName} onChange={(e) => setProgramName(e.target.value)} className="w-full p-3 text-lg rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Make Program Public?</span>
                    <label htmlFor="public-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="public-toggle" className="sr-only peer" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{isPublic ? 'Public' : 'Private'}</span>
                    </label>
                </div>
                <div className="flex border-b border-gray-300 dark:border-gray-700 overflow-x-auto">
                    {weeks.map((week, index) => ( <button key={week.id} onClick={() => setActiveWeekIndex(index)} className={`px-4 py-2 font-semibold whitespace-nowrap ${activeWeekIndex === index ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}>{week.name}</button>))}
                </div>
                <div>
                    {weeks.map((week, weekIndex) => (
                        <div key={week.id} className={activeWeekIndex !== weekIndex ? 'hidden' : 'block'}>
                            {weekIndex > 0 && (<button onClick={() => handleCopyPreviousWeek(weekIndex)} className="w-full mb-4 p-2 flex items-center justify-center space-x-2 font-semibold text-sm text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900"><Copy size={16} /><span>Copy from Previous Week</span></button>)}
                            {week.days.map(day => (
                                <div key={day.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
                                    <input type="text" value={day.name} onChange={(e) => handleDayNameChange(weekIndex, day.id, e.target.value)} className="w-full p-2 mb-3 text-xl font-bold bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700"/>
                                    <div className="space-y-4">
                                        {day.exercises.map(ex => (
                                            <div key={ex.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <input type="text" placeholder="Exercise Name" value={ex.name} onChange={e => handleExerciseChange(weekIndex, day.id, ex.id, 'name', e.target.value)} className="flex-1 p-2 font-semibold rounded bg-white dark:bg-gray-600" />
                                                    <button onClick={() => handleRemoveExercise(weekIndex, day.id, ex.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Trash2 size={20} /></button>
                                                </div>
                                                <div className="space-y-2">
                                                    {ex.sets.map((set, setIndex) => (
                                                        <div key={set.id} className="flex items-center space-x-2">
                                                            <span className="font-bold text-gray-500 dark:text-gray-400 w-6 text-center">{setIndex + 1}</span>
                                                            <input type="text" placeholder="Reps" value={set.reps} onChange={e => handleSetChange(weekIndex, day.id, ex.id, set.id, 'reps', e.target.value)} className="w-1/3 p-2 rounded bg-white dark:bg-gray-600" />
                                                            <input type="text" placeholder="Intensity" value={set.intensity} onChange={e => handleSetChange(weekIndex, day.id, ex.id, set.id, 'intensity', e.target.value)} className="w-1/3 p-2 rounded bg-white dark:bg-gray-600" />
                                                            <input type="text" placeholder="Weight (opt.)" value={set.weight} onChange={e => handleSetChange(weekIndex, day.id, ex.id, set.id, 'weight', e.target.value)} className="w-1/3 p-2 rounded bg-white dark:bg-gray-600" />
                                                            <button onClick={() => handleRemoveSet(weekIndex, day.id, ex.id, set.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={() => handleAddSet(weekIndex, day.id, ex.id)} className="w-full mt-3 p-2 text-sm text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900">+ Add Set</button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => handleAddExercise(weekIndex, day.id)} className="w-full mt-4 p-2 font-semibold text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900">Add Exercise to Day</button>
                                </div>
                            ))}
                             <button onClick={() => handleAddDay(weekIndex)} className="w-full p-2 font-semibold text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Add Day to Week</button>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddWeek} className="w-full p-2 font-semibold text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Add Week</button>
                <button onClick={handleSaveProgram} className="w-full p-3 text-lg font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">Save Program</button>
            </div>
        </div>
    );
};

const BottomNav = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { name: 'Programs', icon: BookOpen }, { name: 'Workout', icon: Dumbbell },
        { name: 'Create', icon: PlusSquare }, { name: 'Settings', icon: SettingsIcon },
    ];
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around shadow-lg">
            {navItems.map(item => (
                <button key={item.name} onClick={() => setActiveTab(item.name)} className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${activeTab === item.name ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'}`}>
                    <item.icon size={24} />
                    <span className="text-xs font-medium mt-1">{item.name}</span>
                </button>
            ))}
        </nav>
    );
};

const ProgramCard = ({ program, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-xl font-bold">{program.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">by {program.author}</p>
        <p className="text-gray-700 dark:text-gray-300">{program.description}</p>
        {children}
    </div>
);

const ExerciseCard = ({ exercise, onExerciseClick, loggedSets, onLogChange }) => {
    const handleSetChange = (index, field, value) => onLogChange(index, field, value);
    const toggleSetComplete = (index) => onLogChange(index, 'completed', !loggedSets[index].completed);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
                <button onClick={() => onExerciseClick(exercise.name)} className="text-left">
                    <h4 className="text-lg font-bold hover:underline">{exercise.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Target: {exercise.sets.length} sets</p>
                </button>
            </div>
            <div className="space-y-2">
                {exercise.sets.map((targetSet, index) => (
                    <div key={index} className={`flex items-center space-x-2 p-2 rounded-md ${loggedSets[index].completed ? 'bg-green-100 dark:bg-green-900/50' : ''}`}>
                        <span className="font-bold text-gray-500 dark:text-gray-400 w-6 text-center">{index + 1}</span>
                        <div className="flex-1 text-center text-sm">
                            <span className="font-semibold">{targetSet.reps}</span><span className="text-gray-500"> reps</span>
                            {targetSet.weight && <span className="text-gray-500"> @ {targetSet.weight}</span>}
                            {targetSet.intensity && <span className="text-gray-500"> ({targetSet.intensity})</span>}
                        </div>
                        <input type="number" placeholder="Reps" value={loggedSets[index].reps} onChange={(e) => handleSetChange(index, 'reps', e.target.value)} className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                        <input type="number" placeholder="Weight" value={loggedSets[index].weight} onChange={(e) => handleSetChange(index, 'weight', e.target.value)} className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                        <button onClick={() => toggleSetComplete(index)} className={`p-2 rounded-full ${loggedSets[index].completed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ExerciseHistoryModal = ({ exerciseName, history, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{exerciseName} History</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="overflow-y-auto space-y-4">
                {history.length > 0 ? history.map((session, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{session.date.toLocaleDateString()}</p>
                        <ul className="list-disc list-inside mt-1 text-gray-600 dark:text-gray-400">
                            {session.sets.map((set, setIndex) => ( <li key={setIndex}>{set.reps} reps @ {set.weight} lbs</li>))}
                        </ul>
                    </div>
                )) : (<p className="text-gray-500 dark:text-gray-400 text-center py-4">No history for this exercise yet.</p>)}
            </div>
        </div>
    </div>
);

export default App;
