const { useState, useEffect } = React;

// 1. Componente de cada Ejercicio
const ExerciseCard = ({ exercise }) => (
    <div className="exercise-card">
        <img src={`${window.BASE_URL}assets/exercises/${exercise.image_url}`} alt={exercise.name} />
        <div className="exercise-info">
            <h4>{exercise.name}</h4>
            <p><strong>Sets:</strong> {exercise.sets || 3}</p>
            <p><strong>Reps:</strong> {exercise.reps || '8-10'}</p>
        </div>
    </div>
);

// 2. Componente de cada Día
const DayRow = ({ dayName, dayIndex, exercises, onRecommend }) => {
    const [isSelecting, setIsSelecting] = useState(false);
    const muscles = ['pecho', 'espalda', 'pierna', 'hombro', 'brazo'];

    return (
        <div className="day-row">
            <h3>{dayName}</h3>
            
            {/* Lista de ejercicios del día */}
            {exercises.map((ex, i) => (
                <ExerciseCard key={i} exercise={ex} />
            ))}

            {/* Acciones */}
            <div className="workout-actions">
                <button className="btn-add">+</button>
                
                {isSelecting ? (
                    <div className="muscle-selector">
                        {muscles.map(m => (
                            <button key={m} onClick={() => { onRecommend(dayIndex, m); setIsSelecting(false); }}>
                                {m}
                            </button>
                        ))}
                    </div>
                ) : (
                    <button className="btn-recom" onClick={() => setIsSelecting(true)}>
                        {window.TXT_RECOMMENDED || 'Recomendado'}
                    </button>
                )}
            </div>
        </div>
    );
};

// 3. Componente Padre (WorkoutApp)
const WorkoutApp = () => {
    const [workouts, setWorkouts] = useState([]);
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    useEffect(() => {
        // Cargar ejercicios iniciales del usuario
        fetch(`${window.BASE_URL}api/get_workouts.php`)
            .then(res => res.json())
            .then(data => setWorkouts(data))
            .catch(err => console.error("Error cargando ejercicios:", err));
    }, []);

    const handleRecommend = (dayIndex, muscle) => {
        const formData = new FormData();
        formData.append('day', dayIndex);
        formData.append('muscle', muscle);

        fetch(`${window.BASE_URL}api/get_recommendation.php`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Actualizamos el estado local añadiendo el nuevo ejercicio
                setWorkouts([...workouts, { ...data.exercise, day_of_week: dayIndex }]);
            } else {
                alert(data.message || "No quedan ejercicios nuevos para este músculo");
            }
        });
    };

    return (
        <div className="workout-container">
            {days.map((day, index) => (
                <DayRow 
                    key={index} 
                    dayName={day} 
                    dayIndex={index}
                    exercises={workouts.filter(w => parseInt(w.day_of_week) === index)}
                    onRecommend={handleRecommend}
                />
            ))}
        </div>
    );
};

// Inyectar en el div
const container = document.getElementById('react-workout-app');
const root = ReactDOM.createRoot(container);
root.render(<WorkoutApp />);