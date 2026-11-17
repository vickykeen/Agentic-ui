import { createRoot } from "react-dom/client";
import { VisualEditor } from "visual-ai-editor";
import "./style.css";

async function resetEdits() {
  try {
    const response = await fetch("/api/visual-editor/edits", {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Could not reset saved edits.");
    location.reload();
  } catch (error) {
    alert(error.message);
  }
}

createRoot(document.getElementById("root")).render(
  <>

    <VisualEditor>
      <main>
        <p className="eyebrow" id="eyebrow">
          A little room to experiment
        </p>
        <h1 id="hero-title">Make this page yours.</h1>
        <p className="intro" id="hero-description">
          Try changing the headline, restyling a button, or adding a little
          color. Your saved changes survive a refresh.
        </p>
        <button className="primary" id="hero-button">
          Start something good
        </button>
        <section className="cards" aria-label="Things to try">
          <article id="card-one">
            <span>01</span>
            <h2 id="card-title-one">A fresh perspective</h2>
            <p id="card-copy-one">Select this text and give it a new voice.</p>
          </article>
          <article id="card-two">
            <span>02</span>
            <h2 id="card-title-two">Room for color</h2>
            <p id="card-copy-two">Try a blue heading or a larger title.</p>
          </article>
          <article
            id="card-three"
            style={{
              backgroundColor: "linear-gradient(to right, #4f46e5, #6366f1)",
            }}
          >
            <span>03</span>
            <h2 id="card-title-three">Keep what works</h2>
            <p id="card-copy-three">
              Refresh to see saved edits, or reset to start over.
            </p>
          </article>
        </section>
      </main>
    </VisualEditor>
  </>,
);
