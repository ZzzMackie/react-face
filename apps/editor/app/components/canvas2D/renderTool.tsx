import styles from '@/assets/moduleCss/canvas.module.css';
import { useUndoRedoState } from '@/hooks/useGlobalUndoRedo';
import { Knife, Material } from '../canvas3D/constant/MaterialData';
import { useEffect } from 'react';
export default function RenderTool() {
	const { state: currentMaterialData } = useUndoRedoState<Material | undefined>('current-material-data');
	const { state: currentKnifeData, updateState: updateCurrentKnifeData } = useUndoRedoState<Knife | undefined | null>('current-knife-data', null);

    useEffect(() => {
        if(!currentKnifeData && currentMaterialData?.knives?.length) {
            updateCurrentKnifeData(currentMaterialData?.knives?.[0], 'add knife', false)
            console.log(currentMaterialData?.knives?.[0], currentKnifeData)
        }
    }, [currentMaterialData, currentKnifeData])
	return (
		<div className={`flex flex-col gap-5 justify-start ${styles.canvas2d_min_height} `}>
			<div className="bg-white p-2">
				<h1>Render Tool</h1>
			</div>
			{
				(currentMaterialData?.knives ?? []).map((knife: Knife, index: number) => (
                    <div key={index} className="bg-white p-2">
                        <p>Knife {index + 1}</p>
                    </div>)
                    )
			}
		</div>
	)
}