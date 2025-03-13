import React, { useState, useEffect } from 'react';

const VisualNovelDiagrammer = () => {
    const [scenes, setScenes] = useState([]);
    const [currentSceneId, setCurrentSceneId] = useState(null);
    const [jsonOutput, setJsonOutput] = useState('');
    const [newSceneId, setNewSceneId] = useState('');

    const createNewScene = (id) => {
        return {
            id: id,
            background: "",
            transition: false,
            dialogue: [],
            next: {
                scene: ""
            }
        };
    };

    useEffect(() => {
        const unloadCallback = (event) => {
            event.preventDefault();
            event.returnValue = "";
            return "";
        };

        window.addEventListener("beforeunload", unloadCallback);
        return () => window.removeEventListener("beforeunload", unloadCallback);
    }, []);

    const addScene = () => {
        const sceneId = newSceneId || `scene_${scenes.length + 1}`;
        if (scenes.some(s => s.id === sceneId)) {
            alert("Scene ID already exists. Please choose a different ID.");
            return;
        }
        const newScene = createNewScene(sceneId);
        setScenes([...scenes, newScene]);
        setCurrentSceneId(sceneId);
        setNewSceneId('');
    };

    const updateScene = (updates) => {
        setScenes(scenes.map(scene =>
            scene.id === currentSceneId ? { ...scene, ...updates } : scene
        ));
    };

    const addDialogue = () => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            const newDialogue = {
                text: "",
                waitForInput: true,
                speakerName: "",
                characters: []
            };
            const updatedDialogue = [...currentScene.dialogue, newDialogue];
            updateScene({ dialogue: updatedDialogue });
        }
    };

    const updateDialogue = (index, field, value) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            const updatedDialogue = [...currentScene.dialogue];
            updatedDialogue[index] = { ...updatedDialogue[index], [field]: value };
            updateScene({ dialogue: updatedDialogue });
        }
    };

    const addCharacter = (dialogueIndex) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            const newCharacter = {
                id: `char_${Date.now()}`,
                name: "",
                emotion: "neutral",
                position: "center",
                visible: true,
                isSpeaking: false
            };
            const updatedDialogue = [...currentScene.dialogue];
            updatedDialogue[dialogueIndex].characters.push(newCharacter);
            updateScene({ dialogue: updatedDialogue });
        }
    };

    const updateCharacter = (dialogueIndex, charIndex, field, value) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            const updatedDialogue = [...currentScene.dialogue];
            updatedDialogue[dialogueIndex].characters[charIndex] = {
                ...updatedDialogue[dialogueIndex].characters[charIndex],
                [field]: value
            };
            updateScene({ dialogue: updatedDialogue });
        }
    };

    const removeCharacter = (dialogueIndex, charIndex) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            const updatedDialogue = [...currentScene.dialogue];
            updatedDialogue[dialogueIndex].characters.splice(charIndex, 1);
            updateScene({ dialogue: updatedDialogue });
        }
    };

    const addChoice = () => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            let next;
            if (currentScene.next.choices) {
                next = {
                    choices: [...currentScene.next.choices, { text: "", nextScene: "" }]
                };
            } else {
                next = {
                    choices: [{ text: "", nextScene: "" }]
                };
            }
            updateScene({ next });
        }
    };

    const updateChoice = (index, field, value) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene && currentScene.next.choices) {
            const updatedChoices = [...currentScene.next.choices];
            updatedChoices[index] = { ...updatedChoices[index], [field]: value };
            updateScene({ next: { choices: updatedChoices } });
        }
    };

    const removeChoice = (index) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene && currentScene.next.choices) {
            const updatedChoices = currentScene.next.choices.filter((_, i) => i !== index);
            if (updatedChoices.length === 0) {
                updateScene({ next: { scene: "" } });
            } else {
                updateScene({ next: { choices: updatedChoices } });
            }
        }
    };

    const deleteScene = (id) => {
        const updatedScenes = scenes.map(scene => {
            if (scene.next.scene === id) {
                return { ...scene, next: { scene: "" } };
            }
            if (scene.next.choices) {
                const updatedChoices = scene.next.choices.map(choice =>
                    choice.nextScene === id ? { ...choice, nextScene: "" } : choice
                );
                return { ...scene, next: { choices: updatedChoices } };
            }
            return scene;
        });
        const filteredScenes = updatedScenes.filter(scene => scene.id !== id);
        setScenes(filteredScenes);
        if (currentSceneId === id) {
            setCurrentSceneId(filteredScenes.length > 0 ? filteredScenes[0].id : null);
        }
    };

    const removeDialogue = (index) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            const updatedDialogue = currentScene.dialogue.filter((_, i) => i !== index);
            updateScene({ dialogue: updatedDialogue });
        }
    };

    const toggleSceneFlow = (useChoices) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            if (useChoices) {
                updateScene({ next: { choices: [{ text: "", nextScene: "" }] } });
            } else {
                updateScene({ next: { scene: "" } });
            }
        }
    };

    const updateNextScene = (sceneId) => {
        updateScene({ next: { scene: sceneId } });
    };

    const exportToJson = () => {
        const output = { scenes: scenes };
        const formatted = JSON.stringify(output, null, 4);
        setJsonOutput(formatted);
    };

    const importFromJson = (jsonStr) => {
        try {
            const parsed = JSON.parse(jsonStr);
            if (parsed && parsed.scenes && Array.isArray(parsed.scenes)) {
                setScenes(parsed.scenes);
                if (parsed.scenes.length > 0) {
                    setCurrentSceneId(parsed.scenes[0].id);
                }
            } else {
                alert('Invalid format. JSON must have a "scenes" array.');
            }
        } catch (e) {
            alert('Invalid JSON format: ' + e.message);
        }
    };

    const currentScene = scenes.find(s => s.id === currentSceneId) || null;
    const hasChoices = currentScene && currentScene.next && currentScene.next.choices;

    const renderDiagram = () => {
        return (
            <div className="p-4 rounded-lg overflow-auto h-full" style={{ backgroundColor: '#202020' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#F7FAFC' }}>Flow Diagram</h3>
                <div className="flex flex-wrap gap-4">
                    {scenes.map(scene => (
                        <div
                            key={scene.id}
                            className="p-3 rounded-lg shadow border-2 cursor-pointer hover:bg-[#4B5B6E] transition-colors"
                            style={{
                                backgroundColor: '#404040',
                                borderColor: scene.id === currentSceneId ? '#A7589F' : 'transparent',
                                minWidth: '180px'
                            }}
                            onClick={() => setCurrentSceneId(scene.id)}
                        >
                            <div className="font-bold" style={{ color: '#F7FAFC' }}>{scene.id}</div>
                            <div className="text-xs mt-1 truncate" style={{ color: '#CBD5E0' }}>
                                {scene.dialogue && scene.dialogue[0]?.text.substring(0, 40)}{scene.dialogue && scene.dialogue[0]?.text.length > 40 ? '...' : ''}
                            </div>
                            <div className="mt-2 text-xs">
                                {scene.next && scene.next.scene ? (
                                    <span className="px-2 py-1 rounded" style={{ backgroundColor: '#718096', color: '#E2E8F0' }}>
                                        → {scene.next.scene}
                                    </span>
                                ) : scene.next && scene.next.choices ? (
                                    <span className="px-2 py-1 rounded" style={{ backgroundColor: '#718096', color: '#E2E8F0' }}>
                                        {scene.next.choices.length} choices
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 rounded" style={{ backgroundColor: '#718096', color: '#CBD5E0' }}>
                                        No connections
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSceneEditor = () => {
        return (
            <div className="p-4 rounded-lg shadow h-full overflow-y-auto" style={{ backgroundColor: '#202020', color: '#F7FAFC' }}>
                {currentScene ? (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1" style={{ color: '#E2E8F0' }}>Scene ID</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                style={{ backgroundColor: '#2D2D2D', color: '#F7FAFC', borderColor: '#718096' }}
                                value={currentScene.id}
                                readOnly
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: '#E2E8F0' }}>Background</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    style={{ backgroundColor: '#2D2D2D', color: '#F7FAFC', borderColor: '#718096' }}
                                    value={currentScene.background}
                                    onChange={(e) => updateScene({ background: e.target.value })}
                                    placeholder="Background image or color"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="transition"
                                    className="mr-2"
                                    style={{ accentColor: '#A7589F' }}
                                    checked={currentScene.transition || false}
                                    onChange={(e) => updateScene({ transition: e.target.checked })}
                                />
                                <label htmlFor="transition" className="text-sm font-medium" style={{ color: '#E2E8F0' }}>Transition Effect</label>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium" style={{ color: '#E2E8F0' }}>Dialogue</label>
                                <button
                                    className="text-sm px-2 py-1 rounded"
                                    style={{ backgroundColor: '#A7589F', color: '#F7FAFC' }}
                                    onClick={addDialogue}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#8C487F'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#A7589F'}
                                >
                                    Add Dialogue
                                </button>
                            </div>

                            {currentScene.dialogue.map((d, index) => (
                                <div key={index} className="p-3 border rounded mb-3" style={{ backgroundColor: '#2D2D2D', borderColor: '#718096' }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                        <div>
                                            <label className="block text-xs mb-1" style={{ color: '#CBD5E0' }}>Speaker Name</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded"
                                                style={{ backgroundColor: '#404040', color: '#F7FAFC', borderColor: '#718096' }}
                                                value={d.speakerName}
                                                onChange={(e) => updateDialogue(index, 'speakerName', e.target.value)}
                                                placeholder="Speaker name"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`waitInput_${index}`}
                                                className="mr-2"
                                                style={{ accentColor: '#A7589F' }}
                                                checked={d.waitForInput}
                                                onChange={(e) => updateDialogue(index, 'waitForInput', e.target.checked)}
                                            />
                                            <label htmlFor={`waitInput_${index}`} className="text-sm" style={{ color: '#CBD5E0' }}>Wait for Input</label>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <label className="block text-xs mb-1" style={{ color: '#CBD5E0' }}>Dialogue Text</label>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            style={{ backgroundColor: '#404040', color: '#F7FAFC', borderColor: '#718096' }}
                                            rows="2"
                                            value={d.text}
                                            onChange={(e) => updateDialogue(index, 'text', e.target.value)}
                                            placeholder="Dialogue text"
                                        />
                                    </div>

                                    <div className="mb-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs" style={{ color: '#CBD5E0' }}>Characters</label>
                                            <button
                                                className="text-sm px-2 py-1 rounded"
                                                style={{ backgroundColor: '#A7589F', color: '#F7FAFC' }}
                                                onClick={() => addCharacter(index)}
                                                onMouseOver={(e) => e.target.style.backgroundColor = '#8C487F'}
                                                onMouseOut={(e) => e.target.style.backgroundColor = '#A7589F'}
                                            >
                                                Add Character
                                            </button>
                                        </div>

                                        {d.characters.map((char, charIndex) => (
                                            <div key={char.id} className="mb-2 p-2 rounded border" style={{ backgroundColor: '#4B5B6E', borderColor: '#718096' }}>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs mb-1" style={{ color: '#CBD5E0' }}>Name</label>
                                                        <input
                                                            type="text"
                                                            className="w-full p-1 border rounded"
                                                            style={{ backgroundColor: '#404040', color: '#F7FAFC', borderColor: '#718096' }}
                                                            value={char.name}
                                                            onChange={(e) => updateCharacter(index, charIndex, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs mb-1" style={{ color: '#CBD5E0' }}>Emotion</label>
                                                        <select
                                                            className="w-full p-1 border rounded"
                                                            style={{ backgroundColor: '#404040', color: '#F7FAFC', borderColor: '#718096' }}
                                                            value={char.emotion}
                                                            onChange={(e) => updateCharacter(index, charIndex, 'emotion', e.target.value)}
                                                        >
                                                            <option value="neutral">Neutral</option>
                                                            <option value="happy">Happy</option>
                                                            <option value="sad">Sad</option>
                                                            <option value="angry">Angry</option>
                                                            <option value="despair">Despair</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs mb-1" style={{ color: '#CBD5E0' }}>Position</label>
                                                        <select
                                                            className="w-full p-1 border rounded"
                                                            style={{ backgroundColor: '#404040', color: '#F7FAFC', borderColor: '#718096' }}
                                                            value={char.position}
                                                            onChange={(e) => updateCharacter(index, charIndex, 'position', e.target.value)}
                                                        >
                                                            <option value="center">Center</option>
                                                            <option value="left">Left</option>
                                                            <option value="right">Right</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={char.visible}
                                                            onChange={(e) => updateCharacter(index, charIndex, 'visible', e.target.checked)}
                                                            style={{ accentColor: '#A7589F' }}
                                                        />
                                                        <label className="text-xs" style={{ color: '#CBD5E0' }}>Visible</label>
                                                        <input
                                                            type="checkbox"
                                                            checked={char.isSpeaking}
                                                            onChange={(e) => updateCharacter(index, charIndex, 'isSpeaking', e.target.checked)}
                                                            style={{ accentColor: '#A7589F' }}
                                                        />
                                                        <label className="text-xs" style={{ color: '#CBD5E0' }}>Speaking</label>
                                                    </div>
                                                </div>
                                                <button
                                                    className="text-red-400 hover:text-red-300 text-xs mt-2"
                                                    onClick={() => removeCharacter(index, charIndex)}
                                                >
                                                    Remove Character
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            className="px-2"
                                            style={{ color: '#FCA5A5' }}
                                            onClick={() => removeDialogue(index)}
                                            onMouseOver={(e) => e.target.style.color = '#F87171'}
                                            onMouseOut={(e) => e.target.style.color = '#FCA5A5'}
                                        >
                                            Remove Dialogue
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" style={{ color: '#E2E8F0' }}>Scene Flow</label>
                            <div className="flex gap-4 mb-3">
                                <button
                                    className="px-3 py-2 rounded"
                                    style={{ backgroundColor: !hasChoices ? '#A7589F' : '#718096', color: !hasChoices ? '#F7FAFC' : '#E2E8F0' }}
                                    onClick={() => toggleSceneFlow(false)}
                                    onMouseOver={(e) => e.target.style.backgroundColor = !hasChoices ? '#8C487F' : '#404040'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = !hasChoices ? '#A7589F' : '#718096'}
                                >
                                    Single Next Scene
                                </button>
                                <button
                                    className="px-3 py-2 rounded"
                                    style={{ backgroundColor: hasChoices ? '#A7589F' : '#718096', color: hasChoices ? '#F7FAFC' : '#E2E8F0' }}
                                    onClick={() => toggleSceneFlow(true)}
                                    onMouseOver={(e) => e.target.style.backgroundColor = hasChoices ? '#8C487F' : '#404040'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = hasChoices ? '#A7589F' : '#718096'}
                                >
                                    Multiple Choices
                                </button>
                            </div>

                            {!hasChoices ? (
                                <div className="flex gap-2 items-center">
                                    <label className="text-sm w-1/4" style={{ color: '#CBD5E0' }}>Next Scene:</label>
                                    <input
                                        type="text"
                                        className="p-2 border rounded w-3/4"
                                        style={{ backgroundColor: '#2D2D2D', color: '#F7FAFC', borderColor: '#718096' }}
                                        value={currentScene.next?.scene || ""}
                                        onChange={(e) => updateNextScene(e.target.value)}
                                        list="scenesList"
                                        placeholder="Enter scene ID"
                                    />
                                    <datalist id="scenesList">
                                        {scenes
                                            .filter(s => s.id !== currentScene.id)
                                            .map(scene => (
                                                <option key={scene.id} value={scene.id} />
                                            ))}
                                    </datalist>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {currentScene.next?.choices?.map((choice, index) => (
                                        <div key={index} className="flex gap-2 mb-2 items-start">
                                            <input
                                                type="text"
                                                className="w-2/3 p-2 border rounded"
                                                style={{ backgroundColor: '#2D2D2D', color: '#F7FAFC', borderColor: '#718096' }}
                                                value={choice.text}
                                                onChange={(e) => updateChoice(index, 'text', e.target.value)}
                                                placeholder="Choice text"
                                            />
                                            <input
                                                type="text"
                                                className="w-1/3 p-2 border rounded"
                                                style={{ backgroundColor: '#2D2D2D', color: '#F7FAFC', borderColor: '#718096' }}
                                                value={choice.nextScene}
                                                onChange={(e) => updateChoice(index, 'nextScene', e.target.value)}
                                                placeholder="Target scene ID"
                                                list="choicesScenesList"
                                            />
                                            <datalist id="choicesScenesList">
                                                {scenes
                                                    .filter(s => s.id !== currentScene.id)
                                                    .map(scene => (
                                                        <option key={scene.id} value={scene.id} />
                                                    ))}
                                            </datalist>
                                            <button
                                                className="px-2"
                                                style={{ color: '#FCA5A5' }}
                                                onClick={() => removeChoice(index)}
                                                onMouseOver={(e) => e.target.style.color = '#F87171'}
                                                onMouseOut={(e) => e.target.style.color = '#FCA5A5'}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="text-sm px-2 py-1 rounded"
                                        style={{ backgroundColor: '#A7589F', color: '#F7FAFC' }}
                                        onClick={addChoice}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#8C487F'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#A7589F'}
                                    >
                                        Add Choice
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center p-4" style={{ color: '#CBD5E0' }}>
                        <p>No scene selected. Add a new scene or select an existing one.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 mx-auto min-h-screen" style={{ backgroundColor: '#111111', color: '#F7FAFC' }}>
            <h1 className="text-2xl font-bold mb-6">Visual Novel Diagrammer</h1>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                <div className="md:col-span-2 p-4 rounded-lg" style={{ backgroundColor: '#202020' }}>
                    <h2 className="text-lg font-semibold mb-3" style={{ color: '#E2E8F0' }}>Scenes</h2>
                    <div className="flex mb-3">
                        <input
                            type="text"
                            className="flex-grow p-2 border rounded-l"
                            style={{ backgroundColor: '#404040', color: '#F7FAFC', borderColor: '#718096' }}
                            placeholder="Scene ID"
                            value={newSceneId}
                            onChange={(e) => setNewSceneId(e.target.value)}
                        />
                        <button
                            className="px-3 py-2 rounded-r"
                            style={{ backgroundColor: '#A7589F', color: '#F7FAFC' }}
                            onClick={addScene}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#8C487F'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#A7589F'}
                        >
                            Add
                        </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {scenes.map(scene => (
                            <div
                                key={scene.id}
                                className="p-2 my-1 rounded cursor-pointer flex justify-between items-center"
                                style={{
                                    backgroundColor: scene.id === currentSceneId ? '#A7589F' : '#404040',
                                    color: scene.id === currentSceneId ? '#F7FAFC' : '#E2E8F0'
                                }}
                                onClick={() => setCurrentSceneId(scene.id)}
                                onMouseOver={(e) => { if (scene.id !== currentSceneId) e.target.style.backgroundColor = '#4B5B6E'; }}
                                onMouseOut={(e) => { if (scene.id !== currentSceneId) e.target.style.backgroundColor = '#404040'; }}
                            >
                                <div className="truncate">{scene.id}</div>
                                <button
                                    className="hover:text-red-300"
                                    style={{ color: '#FCA5A5' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteScene(scene.id);
                                    }}
                                    onMouseOver={(e) => e.target.style.color = '#F87171'}
                                    onMouseOut={(e) => e.target.style.color = '#FCA5A5'}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-5">
                    {renderSceneEditor()}
                </div>

                <div className="md:col-span-5">
                    {renderDiagram()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                    <button
                        className="w-full px-4 py-2 rounded mb-2"
                        style={{ backgroundColor: '#A7589F', color: '#F7FAFC' }}
                        onClick={exportToJson}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#8C487F'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#A7589F'}
                    >
                        Export to JSON
                    </button>
                    {jsonOutput && (
                        <div className="mt-2">
                            <textarea
                                className="w-full p-2 border rounded font-mono text-sm"
                                style={{ backgroundColor: '#2D2D2D', color: '#F7FAFC', borderColor: '#718096' }}
                                rows="12"
                                value={jsonOutput}
                                readOnly
                            />
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#E2E8F0' }}>Import JSON</h3>
                    <textarea
                        className="w-full p-2 border rounded font-mono text-sm"
                        style={{ backgroundColor: '#2D2D2D', color: '#F7FAFC', borderColor: '#718096' }}
                        rows="12"
                        placeholder="Paste JSON here"
                        onChange={(e) => importFromJson(e.target.value)}
                    />
                    <div className="text-sm" style={{ color: '#CBD5E0' }}>
                        <p>Format: <code>{"{ \"scenes\": [ {...}, {...} ] }"}</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualNovelDiagrammer;