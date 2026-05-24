import { Contract, id } from "ethers";
import {
  BadgeCheck,
  Box,
  BrainCircuit,
  Cpu,
  Factory,
  FlaskConical,
  Leaf,
  Orbit,
  ShieldCheck,
  Wrench
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { DPP_CONTRACT_ADDRESS, lifecycleStages, passportKinds } from "./config";
import { manufacturingLifecycleDppAbi } from "./contractAbi";
import { useWallet } from "./useWallet";
import Navbar from "./Navbar";
import ThreeBackground from "./ThreeBackground";

type FormState = {
  tokenId: string;
  serialNumber: string;
  manufacturer: string;
  tokenUri: string;
  evidenceUri: string;
  selectedKind: string;
  selectedStage: string;
};

const initialForm: FormState = {
  tokenId: "1",
  serialNumber: "CLX-2026-001",
  manufacturer: "Foundry ABC",
  tokenUri: "ipfs://replace-with-dpp-metadata-cid",
  evidenceUri: "ipfs://replace-with-evidence-cid",
  selectedKind: "Product",
  selectedStage: "ManufacturingInspection"
};

const ecosystemSteps = [
  "Physical manufacturing",
  "IIoT transformation",
  "Data acquisition",
  "Blockchain streaming",
  "AI prognosis and diagnosis",
  "Ontology and semantic",
  "Metaverse validation",
  "Closed-loop execution"
];

export function App() {
  const { account, status, connect, disconnect, signer, hasWallet } = useWallet();
  const [form, setForm] = useState<FormState>(initialForm);
  const [message, setMessage] = useState("Ready");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const contractConfigured = isConfiguredAddress(DPP_CONTRACT_ADDRESS);
  const canTransact = Boolean(account) && contractConfigured;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const renderInteractiveText = (text: string, stateClass: "state-1" | "state-2") => {
    const words = text.split(" ");
    let globalCharIndex = 0;
    return (
      <span className={`char ${stateClass}`}>
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className="word-span" style={{ display: "inline-flex", marginRight: wordIdx < words.length - 1 ? "6px" : "0px" }}>
            {word.split("").map((char) => {
              globalCharIndex++;
              return (
                <span key={globalCharIndex} data-label={char} style={{ "--i": globalCharIndex } as React.CSSProperties}>
                  {char}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    );
  };

  const contract = async () =>
    new Contract(DPP_CONTRACT_ADDRESS, manufacturingLifecycleDppAbi, await signer());

  async function mintPassport() {
    if (!hasWallet) {
      setMessage("No injected wallet found. Open the app in a wallet-enabled browser.");
      return;
    }
    if (!account) {
      setMessage("Connect your wallet before minting.");
      return;
    }
    if (!contractConfigured) {
      setMessage("Deploy the contract and set VITE_DPP_CONTRACT_ADDRESS before minting.");
      return;
    }

    try {
      setMessage("Preparing mint transaction...");
      const dpp = await contract();
      const kindIndex = passportKinds.indexOf(form.selectedKind as (typeof passportKinds)[number]);
      const tx = await dpp.mintPassport(
        account,
        kindIndex,
        0,
        form.serialNumber,
        form.manufacturer,
        "IN718-HEAT-45678",
        "HT-2026-089",
        form.tokenUri,
        id(form.tokenUri)
      );
      setMessage("Waiting for mint confirmation...");
      await tx.wait();
      setMessage("Passport NFT minted.");
    } catch (error) {
      setMessage(readError(error));
    }
  }

  async function transitionLifecycle() {
    if (!hasWallet) {
      setMessage("No injected wallet found. Open the app in a wallet-enabled browser.");
      return;
    }
    if (!account) {
      setMessage("Connect your wallet before updating the lifecycle stage.");
      return;
    }
    if (!contractConfigured) {
      setMessage("Deploy the contract and set VITE_DPP_CONTRACT_ADDRESS before updating stage.");
      return;
    }

    try {
      setMessage("Preparing lifecycle transition...");
      const dpp = await contract();
      const stageIndex = lifecycleStages.indexOf(
        form.selectedStage as (typeof lifecycleStages)[number]
      );
      const tx = await dpp.transitionLifecycle(
        BigInt(form.tokenId),
        stageIndex,
        id(form.evidenceUri),
        form.evidenceUri
      );
      setMessage("Waiting for lifecycle confirmation...");
      await tx.wait();
      setMessage("Lifecycle stage updated.");
    } catch (error) {
      setMessage(readError(error));
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function chooseKind(kind: (typeof passportKinds)[number]) {
    setForm((current) => ({ ...current, selectedKind: kind }));
    setMessage(`${kind} selected for the mint form.`);
  }

  return (
    <>
      <ThreeBackground />
      <Navbar
        account={account}
        status={status}
        canTransact={canTransact}
        hasWallet={hasWallet}
        onConnect={connect}
        onDisconnect={disconnect}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="workspace">
      <section className="hero">
        <div className="hero-copy">
          <h1>IOTA NFT Lifecycle Layer</h1>
          <p className="hero-text">
            A grounded prototype for the NFT contribution inside the broader autonomous semantic
            manufacturing ecosystem. This layer gives products, machines, maintenance actions, and
            validation steps a traceable digital identity.
          </p>
          <div className="hero-tags">
            <span>IOTA EVM testnet</span>
            <span>Digital product passport</span>
          </div>

        </div>

        <aside className="hero-note hero-note-compact">
          <div className="note-top">
            <span className="note-badge">Prototype build</span>
          </div>
          <p className="hero-note-copy">
            Connect a wallet and use the workbench below to mint lifecycle passports or move an
            asset through its recorded manufacturing stages.
          </p>
          <button className="button" onClick={account ? disconnect : connect}>
            <div className="bg"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 342 208"
              height="208"
              width="342"
              className="splash"
            >
              <path
                strokeLinecap="round"
                strokeWidth="3"
                d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362"
              ></path>
              <path
                strokeLinecap="round"
                strokeWidth="3"
                d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893"
              ></path>
              <path
                strokeLinecap="round"
                strokeWidth="3"
                strokeOpacity="0.3"
                d="M281.133 64.9917C281.133 64.9917 287.96 49.8089 302.934 48.2295C317.908 46.6501 319.712 36.5272 319.712 36.5272"
              ></path>
              <path
                strokeLinecap="round"
                strokeWidth="3"
                strokeOpacity="0.3"
                d="M281.133 138.984C281.133 138.984 287.96 154.167 302.934 155.746C317.908 157.326 319.712 167.449 319.712 167.449"
              ></path>
              <path
                strokeLinecap="round"
                strokeWidth="3"
                d="M230.578 57.4476C230.578 57.4476 225.785 41.5051 236.061 30.4998C246.337 19.4945 244.686 12.9998 244.686 12.9998"
              ></path>
              <path
                strokeLinecap="round"
                strokeWidth="3"
                d="M230.578 150.528C230.578 150.528 225.785 166.471 236.061 177.476C246.337 188.481 244.686 194.976 244.686 194.976"
              ></path>
              <path
                strokeLinecap="round"
                strokeWidth="3"
                strokeOpacity="0.3"
                d="M170.392 57.0278C170.392 57.0278 173.89 42.1322 169.571 29.54C165.252 16.9478 168.751 2.05227 168.751 2.05227"
              ></path>
              <path
                strokeLinecap="round"
                strokeWidth="3"
                strokeOpacity="0.3"
                d="M170.392 150.948C170.392 150.948 173.89 165.844 169.571 178.436C165.252 191.028 168.751 205.924 168.751 205.924"
              ></path>
              <path
                strokeLinecap="round"
                strokeWidth="3"
                d="M112.609 57.4476C112.609 57.4476 117.401 41.5051 107.125 30.4998C96.8492 19.4945 98.5 12.9998 98.5 12.9998"
              ></path>
              <path
                strokeLinecap="round"
                strokeWidth="3"
                d="M112.609 150.528C112.609 150.528 117.401 166.471 107.125 177.476C96.8492 188.481 98.5 194.976 98.5 194.976"
              ></path>
              <path
                strokeLinecap="round"
                strokeWidth="3"
                strokeOpacity="0.3"
                d="M62.2941 64.9917C62.2941 64.9917 55.4671 49.8089 40.4932 48.2295C25.5194 46.6501 23.7159 36.5272 23.7159 36.5272"
              ></path>
              <path
                strokeLinecap="round"
                strokeWidth="3"
                strokeOpacity="0.3"
                d="M62.2941 145.984C62.2941 145.984 55.4671 161.167 40.4932 162.746C25.5194 164.326 23.7159 174.449 23.7159 174.449"
              ></path>
            </svg>

            <div className="wrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 221 42"
                height="42"
                width="221"
                className="path"
              >
                <path
                  strokeLinecap="round"
                  strokeWidth="3"
                  d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855"
                ></path>
              </svg>

              <div className="outline"></div>
              <div className="content">
                {renderInteractiveText(account ? short(account) : "Connect Wallet", "state-1")}

                <div className="icon">
                  <div></div>
                </div>

                {renderInteractiveText(account ? "Disconnect" : "Link Wallet", "state-2")}
              </div>
            </div>
          </button>
        </aside>
      </section>

      <section className="dashboard">
        <aside className="sidebar">
          <div className="book">
            <div className="page-content">
              <span className="section-tag-page">Metadata History</span>
              <p className="sidebar-copy-page">
                The NFT layer sits across the whole manufacturing loop and records evidence from each
                team before the next cycle starts:
              </p>
              <ol className="layer-list">
                {ecosystemSteps.map((step, index) => (
                  <li key={step}>
                    <span>{index + 1}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="cover">
              <div className="spine-crease"></div>
              <div className="section-head">
                <div>
                  <span className="section-tag">Project Map</span>
                  <h2>Where This Layer Sits</h2>
                </div>
                <span className={`pill ${canTransact ? "ok" : "warn"}`}>
                  {canTransact ? "Ready" : "Setup pending"}
                </span>
              </div>
              <div className="cover-art">
                <div className="gold-seal">DPP</div>
                <span className="hover-tip">Hover to Open Passport</span>
              </div>
            </div>
          </div>

          <article className="sidebar-card status-card">
            <div className="section-head">
              <div>
                <span className="section-tag">Setup</span>
                <h2>Current Status</h2>
              </div>
              <span className="mini-chip">live</span>
            </div>
            <div className="status-stack">
              <StatusLine label="Wallet" value={status} />
              <StatusLine
                label="Contract"
                value={contractConfigured ? short(DPP_CONTRACT_ADDRESS) : "Not configured"}
              />
              <StatusLine label="Last action" value={message} />
            </div>
            <p className="setup-note">
              {!hasWallet
                ? "This in-app browser does not expose a wallet extension, so blockchain actions cannot start here yet."
                : !account
                  ? "A wallet is available, but it still needs to be connected before transactions can begin."
                  : !contractConfigured
                    ? "The contract address is still a placeholder. Deploy the contract and set the frontend env value."
                    : "Wallet and contract are in place. Transaction buttons are active."}
            </p>
          </article>
        </aside>

        <section className="workbench">
          <div className="panel-grid">
            <div className="book panel-book">
              <div className="page-content">
                <span className="section-tag-page">Mint Details</span>
                <p className="sidebar-copy-page">
                  Complete the fields below to register this Digital Product Passport component on the IOTA EVM Ledger:
                </p>
                <Field
                  label="Serial Number"
                  value={form.serialNumber}
                  onChange={(value) => update("serialNumber", value)}
                />
                <Field
                  label="Manufacturer"
                  value={form.manufacturer}
                  onChange={(value) => update("manufacturer", value)}
                />
                <label style={{ display: "grid", gap: "7px", marginBottom: "14px", color: "#3a5a4a", fontWeight: 700 }}>
                  NFT Kind
                  <select
                    value={form.selectedKind}
                    onChange={(event) => update("selectedKind", event.target.value)}
                  >
                    {passportKinds.map((kind) => (
                      <option key={kind}>{kind}</option>
                    ))}
                  </select>
                </label>
                <Field
                  label="Metadata URI"
                  value={form.tokenUri}
                  onChange={(value) => update("tokenUri", value)}
                />
                <button className="button" onClick={mintPassport} disabled={!canTransact} style={{ marginTop: "8px" }}>
                  <div className="bg"></div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 342 208"
                    height="208"
                    width="342"
                    className="splash"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M281.133 64.9917C281.133 64.9917 287.96 49.8089 302.934 48.2295C317.908 46.6501 319.712 36.5272 319.712 36.5272"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M281.133 138.984C281.133 138.984 287.96 154.167 302.934 155.746C317.908 157.326 319.712 167.449 319.712 167.449"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M230.578 57.4476C230.578 57.4476 225.785 41.5051 236.061 30.4998C246.337 19.4945 244.686 12.9998 244.686 12.9998"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M230.578 150.528C230.578 150.528 225.785 166.471 236.061 177.476C246.337 188.481 244.686 194.976 244.686 194.976"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M170.392 57.0278C170.392 57.0278 173.89 42.1322 169.571 29.54C165.252 16.9478 168.751 2.05227 168.751 2.05227"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M170.392 150.948C170.392 150.948 173.89 165.844 169.571 178.436C165.252 191.028 168.751 205.924 168.751 205.924"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M112.609 57.4476C112.609 57.4476 117.401 41.5051 107.125 30.4998C96.8492 19.4945 98.5 12.9998 98.5 12.9998"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M112.609 150.528C112.609 150.528 117.401 166.471 107.125 177.476C96.8492 188.481 98.5 194.976 98.5 194.976"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M62.2941 64.9917C62.2941 64.9917 55.4671 49.8089 40.4932 48.2295C25.5194 46.6501 23.7159 36.5272 23.7159 36.5272"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M62.2941 145.984C62.2941 145.984 55.4671 161.167 40.4932 162.746C25.5194 164.326 23.7159 174.449 23.7159 174.449"
                    ></path>
                  </svg>

                  <div className="wrap">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 221 42"
                      height="42"
                      width="221"
                      className="path"
                    >
                      <path
                        strokeLinecap="round"
                        strokeWidth="3"
                        d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855"
                      ></path>
                    </svg>

                    <div className="outline"></div>
                    <div className="content">
                      {renderInteractiveText("Mint Passport", "state-1")}

                      <div className="icon">
                        <div></div>
                      </div>

                      {renderInteractiveText("Deploy Passport", "state-2")}
                    </div>
                  </div>
                </button>
              </div>
              <div className="cover">
                <div className="spine-crease"></div>
                <div className="section-head">
                  <div>
                    <span className="section-tag">Action 01</span>
                    <h2>Mint Lifecycle NFT</h2>
                  </div>
                  <span className="panel-chip">{form.selectedKind}</span>
                </div>
                <div className="cover-art">
                  <div className="gold-seal">MINT</div>
                  <span className="hover-tip">Hover to Open Passport</span>
                </div>
              </div>
            </div>

            <div className="book panel-book">
              <div className="page-content">
                <span className="section-tag-page">State Control</span>
                <p className="sidebar-copy-page">
                  Transit this Digital Product Passport through its manufacturing lifecycle stages:
                </p>
                <Field
                  label="Token ID"
                  value={form.tokenId}
                  onChange={(value) => update("tokenId", value)}
                />
                <label style={{ display: "grid", gap: "7px", marginBottom: "14px", color: "#3a5a4a", fontWeight: 700 }}>
                  New Stage
                  <select
                    value={form.selectedStage}
                    onChange={(event) => update("selectedStage", event.target.value)}
                  >
                    {lifecycleStages.slice(1).map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
                <Field
                  label="Evidence URI"
                  value={form.evidenceUri}
                  onChange={(value) => update("evidenceUri", value)}
                />
                <button className="button" onClick={transitionLifecycle} disabled={!canTransact} style={{ marginTop: "8px" }}>
                  <div className="bg"></div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 342 208"
                    height="208"
                    width="342"
                    className="splash"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M281.133 64.9917C281.133 64.9917 287.96 49.8089 302.934 48.2295C317.908 46.6501 319.712 36.5272 319.712 36.5272"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M281.133 138.984C281.133 138.984 287.96 154.167 302.934 155.746C317.908 157.326 319.712 167.449 319.712 167.449"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M230.578 57.4476C230.578 57.4476 225.785 41.5051 236.061 30.4998C246.337 19.4945 244.686 12.9998 244.686 12.9998"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M230.578 150.528C230.578 150.528 225.785 166.471 236.061 177.476C246.337 188.481 244.686 194.976 244.686 194.976"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M170.392 57.0278C170.392 57.0278 173.89 42.1322 169.571 29.54C165.252 16.9478 168.751 2.05227 168.751 2.05227"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M170.392 150.948C170.392 150.948 173.89 165.844 169.571 178.436C165.252 191.028 168.751 205.924 168.751 205.924"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M112.609 57.4476C112.609 57.4476 117.401 41.5051 107.125 30.4998C96.8492 19.4945 98.5 12.9998 98.5 12.9998"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      d="M112.609 150.528C112.609 150.528 117.401 166.471 107.125 177.476C96.8492 188.481 98.5 194.976 98.5 194.976"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M62.2941 64.9917C62.2941 64.9917 55.4671 49.8089 40.4932 48.2295C25.5194 46.6501 23.7159 36.5272 23.7159 36.5272"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                      d="M62.2941 145.984C62.2941 145.984 55.4671 161.167 40.4932 162.746C25.5194 164.326 23.7159 174.449 23.7159 174.449"
                    ></path>
                  </svg>

                  <div className="wrap">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 221 42"
                      height="42"
                      width="221"
                      className="path"
                    >
                      <path
                        strokeLinecap="round"
                        strokeWidth="3"
                        d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855"
                      ></path>
                    </svg>

                    <div className="outline"></div>
                    <div className="content">
                      {renderInteractiveText("Update Stage", "state-1")}

                      <div className="icon">
                        <div></div>
                      </div>

                      {renderInteractiveText("Sign Transition", "state-2")}
                    </div>
                  </div>
                </button>
              </div>
              <div className="cover">
                <div className="spine-crease"></div>
                <div className="section-head">
                  <div>
                    <span className="section-tag">Action 02</span>
                    <h2>Update Lifecycle Stage</h2>
                  </div>
                  <span className="panel-chip">{form.selectedStage}</span>
                </div>
                <div className="cover-art">
                  <div className="gold-seal">STAGE</div>
                  <span className="hover-tip">Hover to Open Passport</span>
                </div>
              </div>
            </div>
          </div>

          <article className="strip-card">
            <div className="section-head">
              <div>
                <span className="section-tag">NFT Modules</span>
                <h2>Interactive Project Blocks</h2>
              </div>
              <p className="strip-copy">
                The passport types below behave like a real project workbench rather than static
                promo cards.
              </p>
            </div>
          </article>

          <section className="capabilities">
            <Capability
              icon={<Box />}
              title="Product NFT"
              body="Digital identity for manufactured components."
              hint="Click to prefill mint form"
              onClick={() => chooseKind("Product")}
            />
            <Capability
              icon={<Cpu />}
              title="Machine NFT"
              body="Machine lifecycle and equipment provenance."
              hint="Click to prefill mint form"
              onClick={() => chooseKind("Machine")}
            />
            <Capability
              icon={<Wrench />}
              title="Maintenance NFT"
              body="Repair, overhaul, and service evidence."
              hint="Click to prefill mint form"
              onClick={() => chooseKind("Maintenance")}
            />
            <Capability
              icon={<BadgeCheck />}
              title="Quality NFT"
              body="Inspection and certification records."
              hint="Click to prefill mint form"
              onClick={() => chooseKind("Quality")}
            />
            <Capability
              icon={<Factory />}
              title="Supply NFT"
              body="Material custody and traceability."
              hint="Click to prefill mint form"
              onClick={() => chooseKind("SupplyChain")}
            />
            <Capability
              icon={<Leaf />}
              title="Carbon NFT"
              body="Energy and sustainability records."
              hint="Click to prefill mint form"
              onClick={() => chooseKind("Carbon")}
            />
            <Capability
              icon={<FlaskConical />}
              title="Semantic Link"
              body="Ontology and reasoning result anchors."
              hint="UI hook not built yet"
              onClick={() =>
                setMessage("Semantic Link is not wired in the current prototype UI yet.")
              }
            />
            <Capability
              icon={<BrainCircuit />}
              title="Analytics Link"
              body="Prognosis and diagnosis result hashes."
              hint="UI hook not built yet"
              onClick={() =>
                setMessage("Analytics Link is not wired in the current prototype UI yet.")
              }
            />
            <Capability
              icon={<ShieldCheck />}
              title="Validation Link"
              body="Metaverse approval before action."
              hint="UI hook not built yet"
              onClick={() =>
                setMessage("Validation Link is not wired in the current prototype UI yet.")
              }
            />
            <Capability
              icon={<Orbit />}
              title="Closed Loop"
              body="Verifiable record for next process cycle."
              hint="UI hook not built yet"
              onClick={() =>
                setMessage(
                  "Closed Loop is part of the wider workflow and is not wired in this prototype UI yet."
                )
              }
            />
          </section>
        </section>
      </section>
    </main>
    </>
  );
}

function Field(props: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="glow-field">
      {props.label}
      <div className="glow-wrap">
        <div className="glow-glow"></div>
        <div className="glow-darkBorderBg"></div>
        <div className="glow-darkBorderBg"></div>
        <div className="glow-darkBorderBg"></div>
        <div className="glow-white"></div>
        <div className="glow-border"></div>
        <input
          className="glow-input"
          placeholder={`Enter ${props.label.toLowerCase()}…`}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function StatusLine(props: { label: string; value: string }) {
  return (
    <div className="status-line">
      <span>{props.label}</span>
      <strong>{props.value}</strong>
    </div>
  );
}

function Capability(props: {
  icon: React.ReactNode;
  title: string;
  body: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <div className="flip-card">
      <button className="flip-card-inner" type="button" onClick={props.onClick}>
        <div className="flip-card-front">
          <div className="icon">{props.icon}</div>
          <h3>{props.title}</h3>
          <span className="flip-prompt">Interact Module</span>
        </div>
        <div className="flip-card-back">
          <p className="flip-body">{props.body}</p>
          <span className="capability-hint">{props.hint}</span>
        </div>
      </button>
    </div>
  );
}

function short(value: string) {
  if (!value || value.length < 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function isConfiguredAddress(value: string) {
  return (
    /^0x[a-fA-F0-9]{40}$/.test(value) &&
    value !== "0x0000000000000000000000000000000000000000"
  );
}

function readError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const maybeMessage =
      "shortMessage" in error ? error.shortMessage : "message" in error ? error.message : "";
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }
  return "Transaction failed. Check wallet access, contract address, and network.";
}

