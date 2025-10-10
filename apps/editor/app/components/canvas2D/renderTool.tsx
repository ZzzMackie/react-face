import styles from '@/assets/moduleCss/canvas.module.css';
import { useUndoRedoState } from '@/hooks/useGlobalUndoRedo';
import { Knife, Material } from '../canvas3D/constant/MaterialData';
import { useEffect, useState, useRef } from 'react';
export default function RenderTool() {
	const { state: currentMaterialData } = useUndoRedoState<Material | undefined>('current-material-data');
	const { state: currentKnifeData, updateState: updateCurrentKnifeData } = useUndoRedoState<Knife | undefined | null>('current-knife-data', null);
	const { state: currentKnife, updateState: updateCurrentKnife } = useUndoRedoState<string | undefined | null>('current-knife', null);
	const [selectedKnife, setSelectedKnife] = useState<Knife | null>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        // 避免无限循环：只在材质数据变化且没有当前刀版数据时执行一次
        if(!initializedRef.current && !currentKnifeData && currentMaterialData?.knives?.length) {
            initializedRef.current = true;
            const firstKnife = currentMaterialData.knives[0];
            updateCurrentKnifeData(firstKnife, 'add knife', false);
            updateCurrentKnife(firstKnife.meshId, 'add knife', false);
            setSelectedKnife(firstKnife);
            console.log('Setting knife:', firstKnife);
        }
    }, [currentMaterialData, currentKnifeData]);
    
    
	return (
		<div className={`flex flex-col gap-5 justify-start max-w-[200px] ${styles.canvas2d_min_height} `}>
			
			{
				(currentMaterialData?.knives ?? []).map((knife: Knife, index: number) => {
					const isSelected = knife.id === currentKnifeData?.id;
					return (
						<div 
							key={knife.id} 
							className={`bg-white p-2 border ${isSelected ? 'border-stone-950' : 'border-gray-200'} cursor-pointer`}
							onClick={() => {
								updateCurrentKnifeData(knife, `选择刀版 ${knife.name}`, false);
                                updateCurrentKnife(knife.meshId, 'add knife', false);
								setSelectedKnife(knife);
							}}
						>
							<p className="font-medium">Knife {index + 1}: </p>
							<p className="text-xs text-gray-500">ID: {knife.id}</p>
						</div>
					);
				})
			}
		</div>
	)
}