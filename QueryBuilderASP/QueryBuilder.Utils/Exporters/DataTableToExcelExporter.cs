using System;
using System.Data;
using System.IO;
using ClosedXML.Excel;

namespace QueryBuilder.Utils.Exporters
{
    public class DataTableToExcelExporter : IDataTableExporter
    {
        private static DataTableToExcelExporter _instance;

        public bool IncludeTitle { get; set; }

        protected DataTableToExcelExporter()
        {
            IncludeTitle = true;
        }

        public static DataTableToExcelExporter CreateInstance()
        {
            return _instance ?? (_instance = new DataTableToExcelExporter());
        }

        public void DataTableExportToFile(DataTable dataTable, string filePath, string title)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new FileNotFoundException("Incorrect file path.");

            if ((dataTable == null) || (dataTable.Rows.Count == 0))
                throw new ArgumentException("Empty data table.");

            var workbook = AddContentToDocument(dataTable, title);
           
            workbook.SaveAs(filePath);
        }

        private XLWorkbook AddContentToDocument(DataTable dataTable, string title)
        {
            var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add(title);

            if (IncludeTitle)
            {
                worksheet.Cell(1, 1).Value = title;
                worksheet.Range(1, 1, 1, dataTable.Columns.Count).Merge().AddToNamed("Titles");

                var titlesStyle = workbook.Style;
                titlesStyle.Font.Bold = true;
                titlesStyle.Font.FontSize = 16;
                titlesStyle.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                titlesStyle.Fill.BackgroundColor = XLColor.Cyan;
                workbook.NamedRanges.NamedRange("Titles").Ranges.Style = titlesStyle;
            }
            worksheet.Cell(2, 1).InsertTable(dataTable.AsEnumerable());

            worksheet.Columns().AdjustToContents();

            return workbook;
        }

        public MemoryStream DataTableExportToMemory(DataTable dataTable, string title)
        {
            if ((dataTable == null) || (dataTable.Rows.Count == 0))
                throw new ArgumentException("Empty data table.");

            var excelStream = new MemoryStream();

            var workbook = AddContentToDocument(dataTable, title);

            workbook.SaveAs(excelStream);
            excelStream.Position = 0;

            return excelStream;
        }
    }
}