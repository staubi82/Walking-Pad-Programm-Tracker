import React, { useEffect, useRef, useState } from 'react';
import styles from './LiveTrackerDesign2.module.css';

const LiveTrackerDesign2: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [elapsedTime, setElapsedTime] = useState('00:00');
    const [remainingTime, setRemainingTime] = useState('30:00 / 30:00');
    const [progressWidth, setProgressWidth] = useState(0);
    const [currentSpeed, setCurrentSpeed] = useState(3.0); // Demo-Geschwindigkeit
    const [distance, setDistance] = useState(0); // Demo-Distanz
    const [calories, setCalories] = useState(0); // Demo-Kalorien
    const [steps, setSteps] = useState(0); // Demo-Schritte

    // Demo-Daten für den Graphen
    const [dataPoints, setDataPoints] = useState<number[]>(Array(60).fill(3.0));
    const timeRef = useRef(0);

    useEffect(() => {
        // Timer-Simulation (Demo)
        let seconds = 0;
        const timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            setElapsedTime(`${mins}:${secs < 10 ? '0' + secs : secs}`);

            const remaining = Math.max(0, 1800 - seconds); // 30 Minuten = 1800 Sekunden
            const remMins = Math.floor(remaining / 60);
            const remSecs = remaining % 60;
            setRemainingTime(`${remMins}:${remSecs < 10 ? '0' + remSecs : remSecs} / 30:00`);

            // Progress-Bar aktualisieren
            setProgressWidth((seconds / 1800) * 100);

            // Demo-Statistik-Updates (sehr vereinfacht)
            setDistance(prev => parseFloat((prev + 0.01).toFixed(1)));
            setCalories(prev => prev + 1);
            setSteps(prev => prev + 10);

        }, 1000);

        return () => clearInterval(timerInterval);
    }, []);

    useEffect(() => {
        // EKG-Graph Implementation
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const drawEKG = () => {
            const width = canvas.width = canvas.offsetWidth;
            const height = canvas.height = canvas.offsetHeight;
            ctx.clearRect(0, 0, width, height);

            // Linienstil
            ctx.strokeStyle = 'var(--accent)'; // Verwenden Sie CSS-Variablen, wenn möglich, oder hardcodieren Sie die Farbe
            ctx.lineWidth = 3;
            ctx.beginPath();

            // Graph zeichnen
            const step = width / (dataPoints.length - 1);
            const maxSpeed = 6; // Annahme: Max Geschwindigkeit ist 6 km/h

            for (let i = 0; i < dataPoints.length; i++) {
                const x = i * step;
                const y = height - (dataPoints[i] / maxSpeed * height);

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    // EKG-typische Kurven (vereinfacht für Demo)
                    const prevY = height - (dataPoints[i - 1] / maxSpeed * height);

                    // Einfache Linienverbindung für Demo
                     ctx.lineTo(x, y);
                }
            }

            ctx.stroke();

            // Demo-Animation der Daten
            timeRef.current += 0.05;
            const newDataPoints = [...dataPoints.slice(1)];
            const baseSpeed = currentSpeed; // Verwenden Sie die aktuelle Geschwindigkeit
            const variation = Math.sin(timeRef.current) * 0.3;
            newDataPoints.push(Math.max(0.5, baseSpeed + variation));
            setDataPoints(newDataPoints);


            animationFrameId = requestAnimationFrame(drawEKG);
        };

        drawEKG();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [dataPoints, currentSpeed]); // Abhängigkeiten für den Effekt

    const handleSpeedChange = (speed: number) => {
        setCurrentSpeed(speed);
        // Hier würde die Logik zum Senden des Geschwindigkeitsbefehls an das Gerät folgen
        console.log(`Geschwindigkeit geändert zu: ${speed} km/h`);
    };

    const handlePause = () => {
        console.log('Pause geklickt');
        // Hier würde die Logik zum Pausieren folgen
    };

    const handleStop = () => {
        console.log('Beenden geklickt');
        // Hier würde die Logik zum Beenden folgen
    };


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.appTitle}>WalkingPad Pro</div>
                <div className={styles.sessionInfo}>Aktive Session • Heute 15:30</div> {/* Diese Info müsste dynamisch sein */}
            </div>

            <div className={styles.timerContainer}>
                <div className={styles.elapsedTime}>{elapsedTime}</div>
                <div className={styles.remainingTime}>{remainingTime}</div>
            </div>

            <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: `${progressWidth}%` }}></div>
            </div>

            {/* Geschwindigkeitsgraph */}
            <div className={styles.speedGraph}>
                <canvas id="speedCanvas" ref={canvasRef}></canvas>
            </div>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{distance.toFixed(1)}</div>
                    <div className={styles.statLabel}>km</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{calories}</div>
                    <div className={styles.statLabel}>kcal</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{currentSpeed.toFixed(1)}</div>
                    <div className={styles.statLabel}>km/h</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{steps.toLocaleString()}</div>
                    <div className={styles.statLabel}>Schritte</div>
                </div>
            </div>

            <div className={styles.speedControl}>
                {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0].map(speed => (
                    <button
                        key={speed}
                        className={`${styles.speedBtn} ${currentSpeed === speed ? styles.active : ''}`}
                        onClick={() => handleSpeedChange(speed)}
                    >
                        {speed.toFixed(1)}
                    </button>
                ))}
            </div>

            <div className={styles.actionBtns}>
                <button className={`${styles.btn} ${styles.btnPause}`} onClick={handlePause}>Pause</button>
                <button className={`${styles.btn} ${styles.btnStop}`} onClick={handleStop}>Beenden</button>
            </div>
        </div>
    );
};

export default LiveTrackerDesign2;