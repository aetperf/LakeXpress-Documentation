---
layout: default
title: Command Builder
---

# Interactive Command Builder

Build your LakeXpress command interactively.

<div class="command-builder">
  <form id="lakexpress-form">
    <h2>Database Configuration</h2>

    <div class="form-group">
      <label for="auth-file">Authentication File:</label>
      <input type="text" id="auth-file" value="credentials.json" />
    </div>

    <div class="form-group">
      <label for="log-db-id">Log Database ID:</label>
      <input type="text" id="log-db-id" placeholder="e.g., log_db_postgres" />
    </div>

    <div class="form-group">
      <label for="source-db-id">Source Database ID:</label>
      <input type="text" id="source-db-id" placeholder="e.g., source_postgres" />
    </div>

    <div class="form-group">
      <label for="source-db-name">Source Database Name:</label>
      <input type="text" id="source-db-name" placeholder="e.g., production_db" />
    </div>

    <div class="form-group">
      <label for="source-schema">Source Schema Name(s):</label>
      <input type="text" id="source-schema" placeholder="e.g., public or sales_%, orders%" />
    </div>

    <h2>Table Filtering (Optional)</h2>

    <div class="form-group">
      <label for="include-pattern">Include Pattern:</label>
      <input type="text" id="include-pattern" placeholder="e.g., fact_%, dim_%" />
    </div>

    <div class="form-group">
      <label for="exclude-pattern">Exclude Pattern:</label>
      <input type="text" id="exclude-pattern" placeholder="e.g., temp_%, test_%" />
    </div>

    <h2>FastBCP Configuration</h2>

    <div class="form-group">
      <label for="fastbcp-path">FastBCP Directory Path:</label>
      <input type="text" id="fastbcp-path" placeholder="e.g., ./FastBCP_linux-x64_v0.4.0/" />
    </div>

    <div class="form-group">
      <label for="n-jobs">Number of Parallel Tables (--n_jobs):</label>
      <input type="number" id="n-jobs" value="4" min="1" max="32" />
    </div>

    <div class="form-group">
      <label for="fastbcp-p">FastBCP Parallelism (--fastbcp_p):</label>
      <input type="number" id="fastbcp-p" value="2" min="1" max="16" />
    </div>

    <h2>Storage Configuration</h2>

    <div class="form-group">
      <label>Output Destination:</label>
      <div>
        <input type="radio" id="dest-local" name="destination" value="local" checked />
        <label for="dest-local">Local Filesystem</label>
        <input type="radio" id="dest-cloud" name="destination" value="cloud" />
        <label for="dest-cloud">Cloud Storage</label>
      </div>
    </div>

    <div class="form-group" id="local-output-group">
      <label for="output-dir">Output Directory:</label>
      <input type="text" id="output-dir" placeholder="e.g., ./exports" />
    </div>

    <div class="form-group" id="cloud-storage-group" style="display: none;">
      <label for="storage-id">Target Storage ID:</label>
      <input type="text" id="storage-id" placeholder="e.g., aws_s3_01, gcs_01" />
    </div>

    <div class="form-group">
      <label for="sub-path">Sub-Path (Optional):</label>
      <input type="text" id="sub-path" placeholder="e.g., staging/daily" />
    </div>

    <h2>Additional Options</h2>

    <div class="form-group">
      <label for="log-db-mode">Log Database Mode:</label>
      <select id="log-db-mode">
        <option value="">preserve (default)</option>
        <option value="drop">drop</option>
        <option value="truncate">truncate</option>
      </select>
    </div>

    <div class="form-group">
      <label>
        <input type="checkbox" id="generate-metadata" />
        Generate CDM Metadata (--generate_metadata)
      </label>
    </div>

    <div class="form-group">
      <label>
        <input type="checkbox" id="include-entity-files" />
        Include Entity Files (--include_entity_files)
      </label>
    </div>

    <div class="form-group">
      <label>
        <input type="checkbox" id="init-db" />
        Initialize Database (--init_db)
      </label>
    </div>

    <h2>Platform</h2>

    <div class="form-group">
      <label>
        <input type="radio" name="platform" value="linux" checked />
        Linux
      </label>
      <label>
        <input type="radio" name="platform" value="windows" />
        Windows (PowerShell)
      </label>
    </div>

    <button type="button" id="generate-command">Generate Command</button>
  </form>

  <div id="output-section" style="display: none;">
    <h2>Generated Command</h2>
    <pre id="generated-command"></pre>
    <button id="copy-command">Copy to Clipboard</button>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('lakexpress-form');
  const outputSection = document.getElementById('output-section');
  const generatedCommand = document.getElementById('generated-command');
  const generateBtn = document.getElementById('generate-command');
  const copyBtn = document.getElementById('copy-command');

  // Toggle output destination
  document.querySelectorAll('input[name="destination"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const localGroup = document.getElementById('local-output-group');
      const cloudGroup = document.getElementById('cloud-storage-group');
      if (this.value === 'local') {
        localGroup.style.display = 'block';
        cloudGroup.style.display = 'none';
      } else {
        localGroup.style.display = 'none';
        cloudGroup.style.display = 'block';
      }
    });
  });

  generateBtn.addEventListener('click', function() {
    const platform = document.querySelector('input[name="platform"]:checked').value;
    const isWindows = platform === 'windows';
    const cmd = isWindows ? '.\\LakeXpress.exe' : 'LakeXpress';
    const continuation = isWindows ? ' `' : ' \\';

    let parts = [cmd];

    // Auth file
    const authFile = document.getElementById('auth-file').value;
    if (authFile) parts.push(`-a ${authFile}`);

    // Log DB
    const logDbId = document.getElementById('log-db-id').value;
    if (logDbId) parts.push(`--log_db_auth_id ${logDbId}`);

    // Log DB mode
    const logDbMode = document.getElementById('log-db-mode').value;
    if (logDbMode) parts.push(`--log_db_mode ${logDbMode}`);

    // Source DB
    const sourceDbId = document.getElementById('source-db-id').value;
    if (sourceDbId) parts.push(`--source_db_auth_id ${sourceDbId}`);

    const sourceDbName = document.getElementById('source-db-name').value;
    if (sourceDbName) parts.push(`--source_db_name ${sourceDbName}`);

    const sourceSchema = document.getElementById('source-schema').value;
    if (sourceSchema) parts.push(`--source_schema_name ${sourceSchema}`);

    // Table filtering
    const includePattern = document.getElementById('include-pattern').value;
    if (includePattern) parts.push(`--include "${includePattern}"`);

    const excludePattern = document.getElementById('exclude-pattern').value;
    if (excludePattern) parts.push(`--exclude "${excludePattern}"`);

    // FastBCP
    const fastbcpPath = document.getElementById('fastbcp-path').value;
    if (fastbcpPath) parts.push(`--fastbcp_dir_path ${fastbcpPath}`);

    const nJobs = document.getElementById('n-jobs').value;
    if (nJobs) parts.push(`--n_jobs ${nJobs}`);

    const fastbcpP = document.getElementById('fastbcp-p').value;
    if (fastbcpP) parts.push(`--fastbcp_p ${fastbcpP}`);

    // Output destination
    const destination = document.querySelector('input[name="destination"]:checked').value;
    if (destination === 'local') {
      const outputDir = document.getElementById('output-dir').value;
      if (outputDir) parts.push(`--output_dir ${outputDir}`);
    } else {
      const storageId = document.getElementById('storage-id').value;
      if (storageId) parts.push(`--target_storage_id ${storageId}`);
    }

    // Sub-path
    const subPath = document.getElementById('sub-path').value;
    if (subPath) parts.push(`--sub_path ${subPath}`);

    // Additional options
    if (document.getElementById('generate-metadata').checked) {
      parts.push('--generate_metadata');
    }

    if (document.getElementById('include-entity-files').checked) {
      parts.push('--include_entity_files');
    }

    if (document.getElementById('init-db').checked) {
      parts.push('--init_db');
    }

    // Format with line continuations
    const commandStr = parts.join(continuation + '\n  ');

    generatedCommand.textContent = commandStr;
    outputSection.style.display = 'block';
  });

  copyBtn.addEventListener('click', function() {
    const text = generatedCommand.textContent;
    navigator.clipboard.writeText(text).then(function() {
      copyBtn.textContent = 'Copied!';
      setTimeout(function() {
        copyBtn.textContent = 'Copy to Clipboard';
      }, 2000);
    });
  });
});
</script>

<style>
.command-builder {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.form-group input[type="radio"],
.form-group input[type="checkbox"] {
  margin-right: 5px;
}

button {
  padding: 10px 20px;
  background-color: #0366d6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #0256c2;
}

#output-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f6f8fa;
  border-radius: 6px;
}

#generated-command {
  background-color: #ffffff;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 14px;
}

#copy-command {
  margin-top: 10px;
}
</style>

## See Also

- [CLI Reference]({{ '/cli-reference' | relative_url }}) - Complete option reference
- [Quick Start Guide]({{ '/quickstart' | relative_url }}) - Getting started
- [Examples]({{ '/examples' | relative_url }}) - Real-world usage examples
