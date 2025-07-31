import styles from '@/assets/moduleCss/canvas.module.css';
export default function RenderTool() {
    return (
        <div className={`flex flex-col gap-5 justify-start ${styles.canvas2d_min_height} `}>
            <div className="bg-white p-2">
                <h1>Render Tool</h1>
            </div>
        </div>
    )
}