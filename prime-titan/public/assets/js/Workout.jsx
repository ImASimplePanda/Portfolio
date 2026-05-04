const { useState, useEffect } = React;

const ExerciseCard = ({ exercise, onDelete, onUpdate }) => (
    <div className="exercise-card">
        <button className="delete-btn" onClick={() => onDelete(exercise.id)}>✕</button>
        <img src={`${window.BASE_URL}assets/images/${exercise.image_url}`} alt={exercise.name} />
        
        <div className="exercise-info">
            <h4>{exercise.name}</h4>
            {/* Controles de edición en línea */}
            <div className="stats-inputs">
                <input 
                    type="number" 
                    defaultValue={exercise.sets} 
                    onBlur={(e) => onUpdate(exercise.id, 'sets', e.target.value)}
                    className="stat-input"
                    placeholder="S"
                />
                <span>x</span>
                <input 
                    type="number" 
                    defaultValue={exercise.reps} 
                    onBlur={(e) => onUpdate(exercise.id, 'reps', e.target.value)}
                    className="stat-input"
                    placeholder="R"
                />
            </div>
        </div>
    </div>
);

const WorkoutApp = () => {
    const [workouts, setWorkouts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDay, setCurrentDay] = useState(null);
    const [allExercises, setAllExercises] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        loadWorkouts();
    }, []);

    const loadWorkouts = () => {
        fetch(`${window.BASE_URL}actions/get_workouts.php`)
            .then(res => res.json())
            .then(data => setWorkouts(Array.isArray(data) ? data : []))
            .catch(err => console.error(err));
    };

    const openModal = (dayIndex) => {
        setSearchTerm('');
        setCurrentDay(dayIndex);
        fetch(`${window.BASE_URL}actions/get_all_exercises.php`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setAllExercises(data);
                setIsModalOpen(true);
            })
            .catch(err => alert("Error: " + err.message));
    };

    const handleAdd = (exerciseId) => {
        const formData = new FormData();
        formData.append('exercise_id', exerciseId);
        formData.append('day', currentDay);
        
        fetch(`${window.BASE_URL}actions/add_workout.php`, { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => { 
            if (data.success) { 
                setIsModalOpen(false); 
                loadWorkouts(); 
            } else {
                alert(data.message || "Error al añadir");
            }
        });
    };

    const handleUpdate = (workoutId, field, value) => {
        const formData = new FormData();
        formData.append('id', workoutId);
        formData.append('field', field);
        formData.append('value', value);

        fetch(`${window.BASE_URL}actions/update_workout.php`, {
            method: 'POST',
            body: formData
        });
    };

    const handleDelete = (workoutId) => {
        const formData = new FormData();
        formData.append('id', workoutId);
        
        fetch(`${window.BASE_URL}actions/delete_workout.php`, { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => { if (data.success) loadWorkouts(); });
    };

    const handleRecommend = (dayIndex, muscle) => {
        const formData = new FormData();
        formData.append('day', dayIndex);
        formData.append('muscle', muscle);
        fetch(`${window.BASE_URL}actions/get_recommendation.php`, { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => { if (data.success) loadWorkouts(); });
    };

    const filtered = allExercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const grouped = filtered.reduce((acc, ex) => {
        if (!acc[ex.muscle_group]) acc[ex.muscle_group] = [];
        acc[ex.muscle_group].push(ex);
        return acc;
    }, {});

    return (
        <div className="workout-container">
            {window.TXT_DAYS.map((dayName, index) => (
                <div key={index} className="day-row">
                    <h3>{dayName}</h3>
                    {Array.isArray(workouts) && workouts.filter(w => parseInt(w.day_of_week) === index).map((ex) => (
                        <ExerciseCard key={ex.id} exercise={ex} onDelete={handleDelete} onUpdate={handleUpdate} />
                    ))}
                    
                    <div className="workout-actions">
                        <button className="btn-add" onClick={() => openModal(index)}>{window.TXT_ADD}</button>
                        <button className="btn-recom" onClick={() => handleRecommend(index, 'pecho')}>{window.TXT_RECOMMENDED}</button>
                    </div>
                </div>
            ))}
            {/* ... Modal code remains the same ... */}
            {isModalOpen && (
                 <div className="modal-overlay">
                     <div className="modal-content">
                         <button className="close-btn" onClick={() => setIsModalOpen(false)}>X</button>
                         <input type="text" className="search-bar" placeholder={window.TXT_SEARCH} onChange={(e) => setSearchTerm(e.target.value)} />
                         {Object.keys(grouped).map(muscle => (
                             <div key={muscle} className="group-section">
                                 <h3 className="muscle-title">{(window.MUSCLE_TRANSLATIONS[muscle] || muscle).toUpperCase()}</h3>
                                 <div className="modal-grid">
                                     {grouped[muscle].map(ex => (
                                         <div key={ex.id} className="modal-card" onClick={() => handleAdd(ex.id)}>
                                             <img src={`${window.BASE_URL}assets/images/${ex.image_url}`} alt={ex.name} />
                                             <p>{ex.name}</p>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            )}
        </div>
    );
};

const container = document.getElementById('react-workout-app');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<WorkoutApp />);
}