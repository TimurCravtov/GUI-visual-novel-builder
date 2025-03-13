import React, { useState, useEffect } from 'react';

const VisualNovelDiagrammer = () => {
    const [scenes, setScenes] = useState([]);
    const [currentSceneId, setCurrentSceneId] = useState(null);
    const [jsonOutput, setJsonOutput] = useState('');
    const [newSceneId, setNewSceneId] = useState('');

    // Default scene template
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

    // Add a new scene
    const addScene = () => {
        const sceneId = newSceneId || `scene_${scenes.length + 1}`;

        // Check if ID already exists
        if (scenes.some(s => s.id === sceneId)) {
            alert("Scene ID already exists. Please choose a different ID.");
            return;
        }

        const newScene = createNewScene(sceneId);
        setScenes([...scenes, newScene]);
        setCurrentSceneId(sceneId);
        setNewSceneId('');
    };

    // Update scene properties
    const updateScene = (updates) => {
        setScenes(scenes.map(scene =>
            scene.id === currentSceneId ? { ...scene, ...updates } : scene
        ));
    };

    // Add dialogue to current scene
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

    // Update a dialogue entry
    const updateDialogue = (index, field, value) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            const updatedDialogue = [...currentScene.dialogue];

            if (field === 'characters') {
                // Split comma-separated string into array
                value = value.split(',').map(char => char.trim()).filter(char => char);
            }

            updatedDialogue[index] = { ...updatedDialogue[index], [field]: value };
            updateScene({ dialogue: updatedDialogue });
        }
    };

    // Add a character to dialogue
    const addCharacter = (dialogueIndex, character) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene && character) {
            const updatedDialogue = [...currentScene.dialogue];
            const characters = [...updatedDialogue[dialogueIndex].characters, character];
            updatedDialogue[dialogueIndex] = { ...updatedDialogue[dialogueIndex], characters };
            updateScene({ dialogue: updatedDialogue });
        }
    };

    // Remove a character from dialogue
    const removeCharacter = (dialogueIndex, characterIndex) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            const updatedDialogue = [...currentScene.dialogue];
            const characters = [...updatedDialogue[dialogueIndex].characters];
            characters.splice(characterIndex, 1);
            updatedDialogue[dialogueIndex] = { ...updatedDialogue[dialogueIndex], characters };
            updateScene({ dialogue: updatedDialogue });
        }
    };

    // Add a choice
    const addChoice = () => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            let next;

            if (currentScene.next.choices) {
                // If choices already exist, add another one
                next = {
                    choices: [
                        ...currentScene.next.choices,
                        { text: "", nextScene: "" }
                    ]
                };
            } else {
                // If no choices yet, create the choices array
                next = {
                    choices: [{ text: "", nextScene: "" }]
                };
            }

            updateScene({ next });
        }
    };

    // Update a choice
    const updateChoice = (index, field, value) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene && currentScene.next.choices) {
            const updatedChoices = [...currentScene.next.choices];
            updatedChoices[index] = { ...updatedChoices[index], [field]: value };
            updateScene({ next: { choices: updatedChoices } });
        }
    };

    // Remove a choice
    const removeChoice = (index) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene && currentScene.next.choices) {
            const updatedChoices = currentScene.next.choices.filter((_, i) => i !== index);

            // If no choices left, switch back to single scene mode
            if (updatedChoices.length === 0) {
                updateScene({ next: { scene: "" } });
            } else {
                updateScene({ next: { choices: updatedChoices } });
            }
        }
    };

    // Delete a scene
    const deleteScene = (id) => {
        // Update references to this scene from other scenes
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

        // Remove the scene itself
        const filteredScenes = updatedScenes.filter(scene => scene.id !== id);
        setScenes(filteredScenes);

        // Update current scene if necessary
        if (currentSceneId === id) {
            setCurrentSceneId(filteredScenes.length > 0 ? filteredScenes[0].id : null);
        }
    };

    // Remove a dialogue entry
    const removeDialogue = (index) => {
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (currentScene) {
            const updatedDialogue = currentScene.dialogue.filter((_, i) => i !== index);
            updateScene({ dialogue: updatedDialogue });
        }
    };

    // Toggle between single next scene and choices
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

    // Update next scene (single path)
    const updateNextScene = (sceneId) => {
        updateScene({ next: { scene: sceneId } });
    };

    // Export to JSON
    const exportToJson = () => {
        const output = {
            scenes: scenes
        };
        const formatted = JSON.stringify(output, null, 4);
        setJsonOutput(formatted);
    };

    // Import from JSON
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

    // Get the current scene
    const currentScene = scenes.find(s => s.id === currentSceneId) || null;

    // Determine if current scene uses choices
    const hasChoices = currentScene && currentScene.next && currentScene.next.choices;

    // Generate a flow diagram visualization
    const renderDiagram = () => {
        return (
            <div className="flow-diagram p-4 bg-gray-800 rounded-lg overflow-auto h-full">
                <h3 className="text-lg font-semibold mb-3 text-white">Flow Diagram</h3>
                <div className="flex flex-wrap gap-4">
                    {scenes.map(scene => (
                        <div
                            key={scene.id}
                            className="p-3 bg-gray-700 rounded-lg shadow border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                            style={{
                                borderColor: scene.id === currentSceneId ? '#3b82f6' : 'transparent',
                                minWidth: '180px'
                            }}
                            onClick={() => setCurrentSceneId(scene.id)}
                        >
                            <div className="font-bold text-white">{scene.id}</div>
                            <div className="text-xs mt-1 text-gray-300 truncate">
                                {scene.dialogue && scene.dialogue[0]?.text.substring(0, 40)}{scene.dialogue && scene.dialogue[0]?.text.length > 40 ? '...' : ''}
                            </div>
                            <div className="mt-2 text-xs">
                                {scene.next && scene.next.scene ? (
                                    <span className="bg-green-900 text-green-200 px-2 py-1 rounded">
                    → {scene.next.scene}
                  </span>
                                ) : scene.next && scene.next.choices ? (
                                    <span className="bg-purple-900 text-purple-200 px-2 py-1 rounded">
                    {scene.next.choices.length} choices
                  </span>
                                ) : (
                                    <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded">
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

    // Render scene editing form
    const renderSceneEditor = () => {
        return (
            <div className="bg-gray-700 p-4 rounded-lg shadow h-full overflow-y-auto text-white">
                {currentScene ? (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Scene ID</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded bg-gray-600 text-white border-gray-500"
                                value={currentScene.id}
                                readOnly
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Background</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded bg-gray-600 text-white border-gray-500"
                                    value={currentScene.background}
                                    onChange={(e) => updateScene({ background: e.target.value })}
                                    placeholder="Background image or color"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="transition"
                                    className="mr-2 text-blue-500"
                                    checked={currentScene.transition || false}
                                    onChange={(e) => updateScene({ transition: e.target.checked })}
                                />
                                <label htmlFor="transition" className="text-sm font-medium">Transition Effect</label>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium">Dialogue</label>
                                <button
                                    className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                    onClick={addDialogue}
                                >
                                    Add Dialogue
                                </button>
                            </div>

                            {currentScene.dialogue.map((d, index) => (
                                <div key={index} className="p-3 border rounded mb-3 bg-gray-600 border-gray-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                        <div>
                                            <label className="block text-xs mb-1">Speaker Name</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded bg-gray-700 text-white border-gray-500"
                                                value={d.speakerName}
                                                onChange={(e) => updateDialogue(index, 'speakerName', e.target.value)}
                                                placeholder="Speaker name"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`waitInput_${index}`}
                                                className="mr-2 text-blue-500"
                                                checked={d.waitForInput}
                                                onChange={(e) => updateDialogue(index, 'waitForInput', e.target.checked)}
                                            />
                                            <label htmlFor={`waitInput_${index}`} className="text-sm">Wait for Input</label>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <label className="block text-xs mb-1">Dialogue Text</label>
                                        <textarea
                                            className="w-full p-2 border rounded bg-gray-700 text-white border-gray-500"
                                            rows="2"
                                            value={d.text}
                                            onChange={(e) => updateDialogue(index, 'text', e.target.value)}
                                            placeholder="Dialogue text"
                                        />
                                    </div>

                                    <div className="mb-2">
                                        <label className="block text-xs mb-1">Characters (comma-separated)</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded bg-gray-700 text-white border-gray-500"
                                            value={d.characters.join(', ')}
                                            onChange={(e) => updateDialogue(index, 'characters', e.target.value)}
                                            placeholder="character1, character2, ..."
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            className="text-red-400 hover:text-red-300 px-2"
                                            onClick={() => removeDialogue(index)}
                                        >
                                            Remove Dialogue
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Scene Flow</label>
                            <div className="flex gap-4 mb-3">
                                <button
                                    className={`px-3 py-2 rounded ${!hasChoices ? 'bg-blue-600 text-white' : 'bg-gray-600'}`}
                                    onClick={() => toggleSceneFlow(false)}
                                >
                                    Single Next Scene
                                </button>
                                <button
                                    className={`px-3 py-2 rounded ${hasChoices ? 'bg-blue-600 text-white' : 'bg-gray-600'}`}
                                    onClick={() => toggleSceneFlow(true)}
                                >
                                    Multiple Choices
                                </button>
                            </div>

                            {!hasChoices ? (
                                <div className="flex gap-2 items-center">
                                    <label className="text-sm w-1/4">Next Scene:</label>
                                    <input
                                        type="text"
                                        className="p-2 border rounded w-3/4 bg-gray-600 text-white border-gray-500"
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
                                                className="w-2/3 p-2 border rounded bg-gray-600 text-white border-gray-500"
                                                value={choice.text}
                                                onChange={(e) => updateChoice(index, 'text', e.target.value)}
                                                placeholder="Choice text"
                                            />
                                            <input
                                                type="text"
                                                className="w-1/3 p-2 border rounded bg-gray-600 text-white border-gray-500"
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
                                                className="text-red-400 hover:text-red-300 px-2"
                                                onClick={() => removeChoice(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                        onClick={addChoice}
                                    >
                                        Add Choice
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center p-4 text-gray-300">
                        <p>No scene selected. Add a new scene or select an existing one.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 mx-auto bg-gray-900 min-h-screen text-white">
            <h1 className="text-2xl font-bold mb-6">Visual Novel Diagrammer</h1>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                {/* Left sidebar - Scene List */}
                <div className="md:col-span-2 bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-3">Scenes</h2>
                    <div className="flex mb-3">
                        <input
                            type="text"
                            className="flex-grow p-2 border rounded-l bg-gray-700 text-white border-gray-600"
                            placeholder="Scene ID"
                            value={newSceneId}
                            onChange={(e) => setNewSceneId(e.target.value)}
                        />
                        <button
                            className="bg-blue-600 text-white px-3 py-2 rounded-r hover:bg-blue-700"
                            onClick={addScene}
                        >
                            Add
                        </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {scenes.map(scene => (
                            <div
                                key={scene.id}
                                className={`p-2 my-1 rounded cursor-pointer flex justify-between items-center ${scene.id === currentSceneId ? 'bg-blue-900' : 'hover:bg-gray-700'}`}
                                onClick={() => setCurrentSceneId(scene.id)}
                            >
                                <div className="truncate">{scene.id}</div>
                                <button
                                    className="text-red-400 hover:text-red-300"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteScene(scene.id);
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center - Scene Editor */}
                <div className="md:col-span-5">
                    {renderSceneEditor()}
                </div>

                {/* Right - Flow Diagram */}
                <div className="md:col-span-5">
                    {renderDiagram()}
                </div>
            </div>

            {/* JSON Export/Import Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                    <button
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
                        onClick={exportToJson}
                    >
                        Export to JSON
                    </button>
                    {jsonOutput && (
                        <div className="mt-2">
              <textarea
                  className="w-full p-2 border rounded font-mono text-sm bg-gray-700 text-white border-gray-600"
                  rows="12"
                  value={jsonOutput}
                  readOnly
              />
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Import JSON</h3>
                    <textarea
                        className="w-full p-2 border rounded font-mono text-sm bg-gray-700 text-white border-gray-600"
                        rows="12"
                        placeholder="Paste JSON here"
                        onChange={(e) => importFromJson(e.target.value)}
                    />
                    <div className="text-sm text-gray-400">
                        <p>Format: <code>{"{ \"scenes\": [ {...}, {...} ] }"}</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualNovelDiagrammer;