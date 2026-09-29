const fs = require("fs");
const path = require("path");

const imagePath = path.join(__dirname, "./proposal-bg.jpg");
const imageData = fs.readFileSync(imagePath);
const base64Image = `data:image/jpeg;base64,${imageData.toString("base64")}`;

const getProposalTemplate = (content) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PDF with Background</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: 'Arial', sans-serif;
      }
      .page-break { page-break-before: always; }
      .container { margin: 0 auto; padding: 20mm; page-break-inside: avoid; margin-bottom: 20px; }
      .header {
        min-height: 100vh;
        background-image: url("https://node.automatedpricingtool.io:5000/images/proposal-bg.jpg");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
        color: #fff;
      }
      .calculator_main_container { width: 80% !important; margin: 30px auto; }
      .heading { text-align: center !important; margin: 5px 0 !important; }
      .Calculator_container h6 { margin-top: 30px; font-weight: bold; }
      .Calculator_container h5 { margin: 10px 0 !important; }
      .Row_1 {
        display: flex !important;
        width: 100%;
        align-self: center !important;
      }
      .Row_1 .Col_1 {
        font-size: large !important;
        padding: 4px;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        width: 100%;
      }
      .blank_input {
        background: white;
        padding: 0 4px;
        border-radius: 6px;
        margin: 8px 0 !important;
        align-self: center !important;
      }
      .Calculator_container .Button_style { display: flex; margin: 10px 0; }
      .Calculator_container .button_theme {
        border-radius: 12px !important;
        border: 1px solid #ee2325 !important;
        box-shadow: 2px 2px 14px rgba(51, 51, 51, 0.1) !important;
        color: #ee2325 !important;
        margin: 10px auto;
        width: 49%;
      }
      .Calculator_container .button_theme:hover { color: white !important; }
      .Calculator_container .add_placeholder,
      .Calculator_container .add_placeholder_doller {
        position: absolute;
        right: 335px;
        margin-top: 4px;
      }
      .Calculator_container {
        border-radius: 7px;
        background: rgba(238, 35, 37, 0.1);
        padding: 20px;
      }
      .Calculator_container .Answer_Container h5 {
        color: #000;
        font-size: 18px;
        font-weight: 700;
        line-height: 42px;
        margin: 0 !important;
      }
      .Calculator_container .Answer_Container p {
        color: black;
        font-size: 15px;
        font-weight: 600;
        line-height: 34px;
        margin: 0 !important;
      }
      @media (max-width: 767px) {
        .Calculator_container .add_placeholder,
        .Calculator_container .add_placeholder_doller { right: 45px !important; }
      }
      .cal_main {
        box-shadow: rgba(0,0,0,0.05) 0 6px 24px, rgba(0,0,0,0.08) 0 0 0 1px;
        width: 60vw;
        margin: 20px auto;
        padding: 25px;
        border-radius: 7px;
      }
      .cal_main h2 {
        margin-bottom: 25px;
        color: #000;
        font-weight: 800;
        text-transform: capitalize;
      }
      .cal_main h5 {
        color: #000;
        font-weight: 700;
        line-height: 42px;
      }
      .cal_main p {
        font-weight: 500;
        line-height: 34px;
      }
      .cal_main h3 {
        color: #000080 !important;
        font-weight: bolder !important;
        margin: 10px 0 !important;
        font-size: calc(1.3rem + 0.6vw);
        line-height: 1.2;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="container">
        <h1 style="text-align:center"><span style="color:rgb(9,94,151)"><strong>Enter Speaker or Company</strong></span></h1>
        <h3>LEADERSHIP<br />WORKSHOP<br />PROPOSAL</h3>
        <h2 class="APROPOSALTO" style="text-align:left;color:rgb(0,0,0);font-size:18pt;font-family:arial,helvetica,sans-serif"><strong>Prepared for:</strong></h2>
        <h4 class="APROPOSALTO" style="text-align:left;line-height:1"><strong><span style="color:rgb(0,0,0);font-size:14pt">Insert Point of Contact</span></strong></h4>
        <h4 class="APROPOSALTO" style="text-align:left;line-height:1"><strong><span style="color:rgb(0,0,0);font-size:14pt">Insert Point Client Business Name</span></strong></h4>
        <h4 class="MonthDayYear01" style="text-align:left;line-height:1"><strong><span style="color:rgb(0,0,0);font-size:14pt">00 / 00 / 0000</span></strong></h4>
        <h2 class="APROPOSALTO" style="text-align:right;color:rgb(0,0,0);font-size:18pt;font-family:arial,helvetica,sans-serif"><strong>Prepared by:</strong></h2>
        <h4 class="APROPOSALTO" style="text-align:right;line-height:1"><strong><span style="color:rgb(0,0,0);font-size:14pt">Insert Point of Contact</span></strong></h4>
        <h4 class="APROPOSALTO" style="text-align:right;line-height:1"><strong><span style="color:rgb(0,0,0);font-size:14pt">Insert Point Client Business Name</span></strong></h4>
        <h4 class="MonthDayYear01" style="text-align:right;line-height:1"><strong><span style="color:rgb(0,0,0);font-size:18pt">CERTIFIED COACH, SPEAKER AND TRAINER</span></strong></h4>
      </div>
    </div>

    <div class="page-break"></div>
    <div class="container">
      <h2 style="text-align:center"><span style="color:rgb(9,23,153)"><strong>EXECUTIVE SUMMARY</strong></span></h2>
      <h3><strong><span style="color:rgb(9,23,153)">SUBHEAD (optional)</span></strong></h3>
      <p>Summarize the training to be provided, briefly reiterate why you are the best person to provide this training and explain how the company will benefit from the training.</p>
      <p>For example:</p>
      <p>We are pleased to present ABC Inc. with a proposal to train 25 managers. We will bring 25 years of Leadership training plus resources from the #1 leadership guru in the world. We will lead your staff through an in depth study of XXX. As a result of this training your company will experience increased productivity…</p>
    </div>

    <div class="page-break"></div>
    <div class="container">
      <h3><strong><span style="color:rgb(9,23,153)">OBJECTIVES</span></strong></h3>
      <ol>
        <li>Objectives should be a list of what you and the company had previously identified as important concepts that all attendees should grasp through the training.</li>
        <li>Participants will be able to recognize…</li>
        <li>Each team member will…</li>
        <li>Etc, etc, etc</li>
      </ol>
      <h3><strong><span style="color:rgb(9,23,153)">TRAINING SCHEDULE</span></strong></h3>
      <p>Provide a detailed schedule of the training to be provided.</p>
      <p>For example…</p>
      <p>April 1, 2020 - Session 1: <strong>Leadership is Influence</strong></p>
      <p>April 8, 2020 - Session 2: <strong>Leadership is Influence</strong></p>
      <h3><span style="color:rgb(9,23,153)"><strong>RESOURCES</strong></span></h3>
      <ul>
        <li>List any resources that you will be providing.</li>
        <li>- Books</li>
        <li>- Binder for handouts and notes</li>
        <li>- Handouts</li>
        <li>- etc.</li>
      </ul>
    </div>

    <div class="page-break"></div>
    <div class="container">${content}</div>

    <div class="container">
      <h4 style="text-align:center">Workshop Agreement</h4>
      <p>This agreement is between your <span contenteditable="true">Name</span>, <span contenteditable="true">Company Name</span> and <span contenteditable="true">Address</span></p>
      <p><span contenteditable="true">Company Name</span> wishes to retain the services of <span contenteditable="true">Name</span> to deliver training for <span contenteditable="true">_________________</span> participants.</p>
      <p><strong>Date:</strong> <span contenteditable="true">_________________</span></p>
      <p><strong>Program Time:</strong> <span contenteditable="true">_________________</span></p>
      <p><strong>Program Location:</strong> <span contenteditable="true">_________________</span></p>
      <p><strong>Program Title:</strong> <span contenteditable="true">_________________</span></p>
      <p><strong>Number of Participants:</strong> <span contenteditable="true">_________________</span></p>
      <p>Provide understanding of agreement: Full Service Solutions agrees to present the information and material contained in the program described above. Full Service Solutions also agrees to coordinate the details of this program with Jane Doe (identify Point of Contact) in order to achieve the outcomes that ABC Inc has stated. ABC Inc agrees to provide the room setup and audiovisual equipment described below.</p>
      <ul>
        <li>Program Logistics (list specific requirements – things to consider are listed)</li>
        <li>When do you need access to the room?</li>
        <li>How should the room be set up?</li>
        <li>What equipment needs to be available and/or setup?</li>
        <li>Will you need technical support available?</li>
        <li>What refreshments are you expecting and who will provide them?</li>
      </ul>
      <p>In exchange for the products and services provided, ABC Inc agrees to compensate Full Service Solutions as follows:</p>
      <p><strong>Professional Fee:</strong> <span contenteditable="true">Amount</span></p>
      <p><strong>Deposit:</strong> Describe how much and when Deposit is due – When contract is signed?</p>
      <p><strong>Balance:</strong> Describe how much and when balance is due – At completion of training?</p>
      <p>You may want to add here what happens if training is canceled for any reason. Is there a full refund? Is the refund prorated based on when canceled prior to training (ie. 30 days out)? Is the client responsible to pay costs of books, Binders, etc.? How should they notify you of cancelation?</p>
      <ul>
        <li>Other considerations:</li>
        <li style="list-style-type:none">- Can the client record your training?</li>
        <li style="list-style-type:none">- Can the client substitute participants?</li>
      </ul>
      <p>This constitutes the entire agreement between both parties.</p>
      <div><p><span contenteditable="true">___Name___</span> <span contenteditable="true">___Date___</span></p></div>
    </div>
  </body>
</html>`;
};

module.exports = getProposalTemplate;
