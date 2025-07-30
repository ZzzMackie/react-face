"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from '../../assets/css/panel.module.css';

export default function ViewPanel() {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div 
            className={`${styles.panel_container}`}
        >
            {/* 圆形按钮 */}
            <motion.div 
                className={styles.panel_round}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <div className="w-full h-full flex items-center justify-center text-white text-center leading-6">
                    3D
                </div>
            </motion.div>
            
            {/* 展开的面板内容 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className="absolute top-0 right-0 h-full bg-white shadow-lg rounded-l-lg"
                        initial={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: "50%",
                            opacity: 0,
                            scale: 0
                        }}
                        animate={{ 
                            width: "25%", 
                            height: "100%", 
                            borderRadius: "8px 0 0 8px",
                            opacity: 1,
                            scale: 1
                        }}
                        exit={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: "50%",
                            opacity: 0,
                            scale: 0
                        }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 30,
                            duration: 0.5
                        }}
                        style={{ transformOrigin: "top right" }}
                    >
                        <motion.div 
                            className="p-6 h-full overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <motion.h2 
                                    className="text-xl font-semibold text-gray-800"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.3 }}
                                >
                                    3D Panel
                                </motion.h2>
                                <motion.button 
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    ✕
                                </motion.button>
                            </div>
                            
                            {/* 面板内容 */}
                            <motion.div 
                                className="space-y-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                            >
                                <motion.div 
                                    className="p-4 bg-gray-50 rounded-lg"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <h3 className="font-medium text-gray-700 mb-2">3D Settings</h3>
                                    <p className="text-sm text-gray-600">Configure your 3D view settings here.</p>
                                </motion.div>
                                
                                <motion.div 
                                    className="p-4 bg-gray-50 rounded-lg"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <h3 className="font-medium text-gray-700 mb-2">Camera Controls</h3>
                                    <p className="text-sm text-gray-600">Adjust camera position and angle.</p>
                                </motion.div>
                                
                                <motion.div 
                                    className="p-4 bg-gray-50 rounded-lg"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <h3 className="font-medium text-gray-700 mb-2">Lighting</h3>
                                    <p className="text-sm text-gray-600">Control scene lighting and shadows.</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}