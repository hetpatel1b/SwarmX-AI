import { performance } from 'perf_hooks';

const TOPICS = [
  "Future of AI in healthcare"
];

const checkQuality = (res, topic) => {
  console.log(`\n=== RESULTS FOR: ${topic} ===`);
  if (!res.success) {
    console.error(`❌ PIPELINE FAILED: ${res.error}`);
    return false;
  }
  
  const p = res.pipeline;
  let passed = true;

  // Research
  const r = p.research?.data || p.research?.fallbackData || {};
  if (r.rawData && r.rawData.length >= 800 && !r.rawData.includes("timed out")) {
    console.log(`✅ Research passed (Length: ${r.rawData.length} chars)`);
  } else {
    console.error(`❌ Research failed (Length: ${r.rawData?.length}, Fallback text detected)`);
    passed = false;
  }

  // Fact Check
  const fc = p.factCheck?.data || p.factCheck?.fallbackData || {};
  const fcCount = (fc.verifiedFacts?.length || 0) + (fc.flaggedClaims?.length || 0);
  if (fcCount >= 3 && !JSON.stringify(fc).includes("timed out")) {
    console.log(`✅ Fact Check passed (${fcCount} combined facts/claims)`);
  } else {
    console.error(`❌ Fact Check failed (${fcCount} facts, Fallback detected)`);
    passed = false;
  }

  // Analysis (Summary & Insights)
  const sum = p.summary?.data || p.summary?.fallbackData || {};
  if (sum.summary && sum.summary.length >= 300 && !sum.summary.includes("timed out")) {
    console.log(`✅ Summary passed (Length: ${sum.summary.length} chars)`);
  } else {
    console.error(`❌ Summary failed (Length: ${sum.summary?.length}, Fallback detected)`);
    passed = false;
  }

  const ins = p.insight?.data || p.insight?.fallbackData || {};
  if (ins.keyInsights && ins.keyInsights.length >= 5) {
    console.log(`✅ Insights passed (${ins.keyInsights.length} insights)`);
  } else {
    console.error(`❌ Insights failed (${ins.keyInsights?.length} insights)`);
    passed = false;
  }

  // Presentation
  const pres = p.presentation?.data || p.presentation?.fallbackData || {};
  if (pres.slides && pres.slides.length >= 5 && !JSON.stringify(pres).includes("timed out")) {
    console.log(`✅ Presentation passed (${pres.slides.length} slides)`);
  } else {
    console.error(`❌ Presentation failed (${pres.slides?.length} slides)`);
    passed = false;
  }

  return passed;
};

async function runTests() {
  for (const topic of TOPICS) {
    console.log(`\nTesting: ${topic}...`);
    const start = performance.now();
    try {
      const response = await fetch('http://localhost:5000/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: topic })
      });
      const data = await response.json();
      const time = ((performance.now() - start) / 1000).toFixed(2);
      console.log(`Request completed in ${time}s`);
      
      const pass = checkQuality(data, topic);
      if (!pass) {
        console.error("TEST FAILED for topic:", topic);
      } else {
        console.log("TEST PASSED for topic:", topic);
      }
    } catch (err) {
      console.error(`Error testing ${topic}:`, err.message);
    }
  }
}

runTests();
