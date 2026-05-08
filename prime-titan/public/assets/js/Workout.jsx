const { useState, useEffect } = React;

// --- COMPONENTE HIJO (Card) ---
const ExerciseCard = ({ exercise, onDelete, onUpdate }) => (
    <div className="exercise-card">
        <button className="delete-btn" onClick={() => onDelete(exercise.id)}>✕</button>
        <img 
            className="exercise-thumb"
            src={`${window.BASE_URL}assets/images/${exercise.image_url || 'default.jpg'}`} 
            alt={exercise.name} 
        />
        <div className="exercise-info">
            <h4 className="exercise-title">{exercise.name}</h4>
            <div className="stats-inputs">
                <input type="number" defaultValue={exercise.sets} onBlur={(e) => onUpdate(exercise.id, 'sets', e.target.value)} className="stat-input" />
                <span>x</span>
                <input type="number" defaultValue={exercise.reps} onBlur={(e) => onUpdate(exercise.id, 'reps', e.target.value)} className="stat-input" />
            </div>
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL ---
const WorkoutApp = () => {
    const [workouts, setWorkouts] = useState([]);
    const [allExercises, setAllExercises] = useState([]);
    const [currentDay, setCurrentDay] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estados para Modales
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRecModalOpen, setIsRecModalOpen] = useState(false);
    
    // Estados para Recomendación
    const [selectedMuscle, setSelectedMuscle] = useState(null);
    const [recommendedList, setRecommendedList] = useState([]);

    useEffect(() => { loadWorkouts(); }, []);

    const loadWorkouts = () => {
        fetch(`${window.BASE_URL}actions/get_workouts.php`)
            .then(res => res.json())
            .then(data => setWorkouts(Array.isArray(data) ? data : []));
    };

    // --- LÓGICA DE RECOMENDACIÓN (Detecta cambio de músculo y trae los datos) ---
    useEffect(() => {
        if (selectedMuscle) {
            fetch(`${window.BASE_URL}actions/get_recommended.php?muscle=${selectedMuscle}`)
                .then(res => res.json())
                .then(data => setRecommendedList(Array.isArray(data) ? data : []))
                .catch(err => console.error("Error al cargar recomendados:", err));
        }
    }, [selectedMuscle]);

    const openAddModal = (dayIndex) => {
        setSearchTerm('');
        setCurrentDay(dayIndex);
        fetch(`${window.BASE_URL}actions/get_all_exercises.php`)
            .then(res => res.json())
            .then(data => { setAllExercises(Array.isArray(data) ? data : []); setIsAddModalOpen(true); });
    };

    const handleAdd = (exerciseId) => {
        const formData = new FormData();
        formData.append('exercise_id', exerciseId);
        formData.append('day', currentDay);
        
        fetch(`${window.BASE_URL}actions/add_workout.php`, { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => { 
            if (data.success) { 
                setIsAddModalOpen(false); 
                setIsRecModalOpen(false);
                setSelectedMuscle(null);
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
        fetch(`${window.BASE_URL}actions/update_workout.php`, { method: 'POST', body: formData });
    };

    const handleDelete = (workoutId) => {
        const formData = new FormData();
        formData.append('id', workoutId);
        fetch(`${window.BASE_URL}actions/delete_workout.php`, { method: 'POST', body: formData })
        .then(() => loadWorkouts());
    };

    const filtered = allExercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const grouped = filtered.reduce((acc, ex) => {
        if (!acc[ex.muscle_group]) acc[ex.muscle_group] = [];
        acc[ex.muscle_group].push(ex);
        return acc;
    }, {});

    return (
        <div className="workout-container">
            {TXT_DAYS.map((dayName, index) => (
                <div key={index} className="day-row">
                    <h3>{dayName}</h3>
                    {workouts.filter(w => parseInt(w.day_of_week) === index).map((ex) => (
                        <ExerciseCard key={ex.id} exercise={ex} onDelete={handleDelete} onUpdate={handleUpdate} />
                    ))}
                    
                    <div className="workout-actions">
                        <button className="btn-add" onClick={() => openAddModal(index)}>{TXT_ADD}</button>
                        <button className="btn-recom" onClick={() => { setCurrentDay(index); setIsRecModalOpen(true); }}>{TXT_RECOMMENDED}</button>
                    </div>
                </div>
            ))}

            {/* MODAL 1: BUSCADOR GENERAL */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-x" onClick={() => setIsAddModalOpen(false)}>X</button>
                        <input type="text" className="search-bar" placeholder={TXT_SEARCH} onChange={(e) => setSearchTerm(e.target.value)} />
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

            {/* MODAL 2: RECOMENDADO POR MÚSCULO */}
            {isRecModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => { setIsRecModalOpen(false); setSelectedMuscle(null); }}>X</button>
                        
                        {!selectedMuscle ? (
                            <div>
                                <h3>{window.TXT_TRAIN_QUESTION}</h3>
                                <div className="muscle-selector">
                                    {Object.keys(window.MUSCLE_TRANSLATIONS).map(m => (
                                        <button key={m} onClick={() => setSelectedMuscle(m)}>
                                            {window.MUSCLE_TRANSLATIONS[m].toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <button className="btn-back" onClick={() => setSelectedMuscle(null)}>{window.TXT_BACK}</button>
                                <h3>{window.TXT_EXERCISES_FOR} {window.MUSCLE_TRANSLATIONS[selectedMuscle]}</h3>
                                <div className="modal-grid">
                                    {recommendedList.length > 0 ? (
                                        recommendedList.map(ex => (
                                            <div key={ex.id} className="modal-card" onClick={() => handleAdd(ex.id)}>
                                                <img src={`${window.BASE_URL}assets/images/${ex.image_url}`} alt={ex.name} />
                                                <p>{ex.name}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>{window.TXT_NO_EXERCISES_FOUND}</p>
                                    )}
                                </div>
                            </div>
                        )}
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