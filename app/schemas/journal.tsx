const handleAudioResponse = async () => {
  const userEntry = "Sample text"; // Use actual entry value
  const userMood = { emoji: "😐", label: "Neutral", value: "neutral" }; // Use the structured mood object

  const res = await fetch("http://localhost:8000/journal/respond/audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: userEntry, mood: userMood }),
  });
  const audioBlob = await res.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
};