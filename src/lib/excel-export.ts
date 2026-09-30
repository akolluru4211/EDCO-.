/**
 * Professional Excel & CSV Export Generator for EdWorld Co Admin Portal
 * Generates formatted, multi-column Excel spreadsheets (.xls / .xlsx compatible XML)
 * with styled headers, typed cells, UTF-8 encoding, and instant browser download.
 */

export interface ExcelUserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age_band?: string;
  career_stage?: string;
  grade?: string;
  points?: number;
  current_streak?: number;
  longest_streak?: number;
  quests_completed?: number;
  interviews_count?: number;
  avg_interview_score?: number;
  resumes_count?: number;
  badges_count?: number;
  badges_list?: string[];
  is_admin?: boolean;
  is_suspended?: boolean;
  status?: string;
  role?: string;
  created_at?: string;
}

/**
 * Escapes XML entities to prevent spreadsheet XML parsing errors
 */
function escapeXml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generates an XML-based Excel Workbook (.xls) that opens natively in Microsoft Excel,
 * Apple Numbers, LibreOffice Calc, and Google Sheets with styled headers.
 */
export function generateExcelWorkbookXml(records: ExcelUserRecord[], sheetTitle = "EdWorld Users"): string {
  const headers = [
    "User ID",
    "Full Name",
    "Email Address",
    "Phone",
    "Age Band",
    "Career Stage",
    "Education / Grade",
    "Role",
    "XP Points",
    "Current Streak (Days)",
    "Longest Streak (Days)",
    "Quests Completed",
    "Mock Interviews",
    "Avg Interview Score (%)",
    "Resumes Built",
    "Badges Count",
    "Status",
    "Joined Date",
  ];

  const headerCellsXml = headers
    .map(
      (h) => `
        <Cell ss:StyleID="HeaderStyle">
          <Data ss:Type="String">${escapeXml(h)}</Data>
        </Cell>`
    )
    .join("");

  const rowsXml = records
    .map((u) => {
      const statusLabel = u.is_suspended ? "Suspended" : u.status || "Active";
      const roleLabel = u.is_admin ? "Administrator" : u.role || "Student / Learner";
      const joinedDate = u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A";

      return `
        <Row ss:AutoFitHeight="1">
          <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(u.id)}</Data></Cell>
          <Cell ss:StyleID="BoldDataStyle"><Data ss:Type="String">${escapeXml(u.name || "Anonymous")}</Data></Cell>
          <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(u.email || "N/A")}</Data></Cell>
          <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(u.phone || "N/A")}</Data></Cell>
          <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(u.age_band || "N/A")}</Data></Cell>
          <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(u.career_stage || "N/A")}</Data></Cell>
          <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(u.grade || "N/A")}</Data></Cell>
          <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(roleLabel)}</Data></Cell>
          <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${Number(u.points || 0)}</Data></Cell>
          <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${Number(u.current_streak || 0)}</Data></Cell>
          <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${Number(u.longest_streak || 0)}</Data></Cell>
          <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${Number(u.quests_completed || 0)}</Data></Cell>
          <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${Number(u.interviews_count || 0)}</Data></Cell>
          <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${Number(u.avg_interview_score || 0)}</Data></Cell>
          <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${Number(u.resumes_count || 0)}</Data></Cell>
          <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${Number(u.badges_count || (u.badges_list?.length || 0))}</Data></Cell>
          <Cell ss:StyleID="${u.is_suspended ? "SuspendedStyle" : "ActiveStyle"}"><Data ss:Type="String">${escapeXml(statusLabel)}</Data></Cell>
          <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(joinedDate)}</Data></Cell>
        </Row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>EdWorld Co. Administration</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>EdWorld Co.</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#13141B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#00D2B4"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#13141B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataStyle">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#13141B"/>
  </Style>
  <Style ss:ID="BoldDataStyle">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#13141B"/>
  </Style>
  <Style ss:ID="NumberStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#13141B"/>
  </Style>
  <Style ss:ID="ActiveStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#0A5245"/>
   <Interior ss:Color="#E6FBF7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SuspendedStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#991B1B"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetTitle)}">
  <Table ss:DefaultColumnWidth="120" ss:DefaultRowHeight="22">
   <Column ss:Width="160"/>
   <Column ss:Width="150"/>
   <Column ss:Width="200"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   <Column ss:Width="140"/>
   <Column ss:Width="160"/>
   <Column ss:Width="130"/>
   <Column ss:Width="90"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>
   <Column ss:Width="130"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="90"/>
   <Column ss:Width="100"/>
   <Row ss:AutoFitHeight="1" ss:Height="26">
    ${headerCellsXml}
   </Row>
   ${rowsXml}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>1</SplitHorizontal>
   <TopRowBottomPane>1</TopRowBottomPane>
   <ActivePane>2</ActivePane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;
}

/**
 * Downloads records as an Excel Workbook (.xls) file directly in the browser
 */
export function downloadUsersAsExcel(records: ExcelUserRecord[], fileNamePrefix = "edworld_users"): void {
  const xml = generateExcelWorkbookXml(records);
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `${fileNamePrefix}_${dateStr}.xls`;

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads records as a UTF-8 BOM CSV file (natively handled by Microsoft Excel without encoding glitches)
 */
export function downloadUsersAsCsv(records: ExcelUserRecord[], fileNamePrefix = "edworld_users"): void {
  const headers = [
    "User ID",
    "Full Name",
    "Email Address",
    "Phone",
    "Age Band",
    "Career Stage",
    "Education / Grade",
    "Role",
    "XP Points",
    "Current Streak",
    "Longest Streak",
    "Quests Completed",
    "Mock Interviews",
    "Avg Interview Score",
    "Resumes Built",
    "Badges Count",
    "Status",
    "Joined Date",
  ];

  const rows = records.map((u) => [
    `"${(u.id || "").replace(/"/g, '""')}"`,
    `"${(u.name || "").replace(/"/g, '""')}"`,
    `"${(u.email || "").replace(/"/g, '""')}"`,
    `"${(u.phone || "N/A").replace(/"/g, '""')}"`,
    `"${(u.age_band || "N/A").replace(/"/g, '""')}"`,
    `"${(u.career_stage || "N/A").replace(/"/g, '""')}"`,
    `"${(u.grade || "N/A").replace(/"/g, '""')}"`,
    `"${(u.is_admin ? "Administrator" : u.role || "Student").replace(/"/g, '""')}"`,
    u.points || 0,
    u.current_streak || 0,
    u.longest_streak || 0,
    u.quests_completed || 0,
    u.interviews_count || 0,
    u.avg_interview_score || 0,
    u.resumes_count || 0,
    u.badges_count || (u.badges_list?.length || 0),
    `"${u.is_suspended ? "Suspended" : u.status || "Active"}"`,
    `"${u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}"`,
  ]);

  // \uFEFF is the UTF-8 Byte Order Mark for Excel
  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `${fileNamePrefix}_${dateStr}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
