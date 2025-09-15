/**
 * 编辑器数据提供者组件
 * 负责向子组件提供统一的数据接口
 * 遵循单一职责原则 (SRP)
 */
import { createContext, useContext, ReactNode } from 'react';
import { useEditorData } from '@/hooks/useEditorData';
import { Model, Material } from '@/app/components/canvas3D/constant/MaterialData';

interface EditorDataContextType {
  // 数据状态
  models: Model[];
  materials: Material[];
  currentModel: Model | null;
  currentMaterial: Material | null;
  
  // 操作方法
  setModels: (models: Model[]) => void;
  setMaterials: (materials: Material[]) => void;
  setCurrentModel: (model: Model | null) => void;
  setCurrentMaterial: (material: Material | null) => void;
  
  // 状态信息
  isInitialized: boolean;
  error: string | null;
}

const EditorDataContext = createContext<EditorDataContextType | null>(null);

interface EditorDataProviderProps {
  children: ReactNode;
  initialModels: Model[];
  initialMaterials: Material[];
}

export function EditorDataProvider({ 
  children, 
  initialModels, 
  initialMaterials 
}: EditorDataProviderProps) {
  const editorData = useEditorData(initialModels, initialMaterials);
  
  return (
    <EditorDataContext.Provider value={editorData}>
      {children}
    </EditorDataContext.Provider>
  );
}

export function useEditorDataContext(): EditorDataContextType {
  const context = useContext(EditorDataContext);
  if (!context) {
    throw new Error('useEditorDataContext must be used within EditorDataProvider');
  }
  return context;
}