const { Document, Paragraph, Table, TableRow, TableCell, TextRun } = require('docx');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');

async function generateResourceDoc(resourceData) {
  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `项目资源测算报告 - ${resourceData.projectName}`,
                bold: true,
                size: 32
              })
            ]
          }),
          
          // Project Duration
          new Paragraph({
            children: [
              new TextRun({
                text: '项目周期',
                bold: true,
                size: 24
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun(`开始日期: ${resourceData.duration.startDate}`),
              new TextRun(`\n结束日期: ${resourceData.duration.endDate}`),
              new TextRun(`\n总天数: ${resourceData.duration.totalDays}天`)
            ]
          }),

          // Resource Allocation
          new Paragraph({
            children: [
              new TextRun({
                text: '资源分配',
                bold: true,
                size: 24
              })
            ]
          }),
          createResourceTable(resourceData.resourceAllocation),

          // Total Cost
          new Paragraph({
            children: [
              new TextRun({
                text: '总成本估算',
                bold: true,
                size: 24
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun(`总成本: ¥${resourceData.totalCost.toLocaleString()}`)
            ]
          })
        ]
      }]
    });

    // Create docs directory if it doesn't exist
    const docsDir = path.join(process.cwd(), 'docs');
    await fs.mkdir(docsDir, { recursive: true });

    // Generate unique filename
    const filename = `${resourceData.projectName}-${Date.now()}.docx`;
    const filepath = path.join(docsDir, filename);

    // Save document
    await fs.writeFile(filepath, await doc.save());
    
    return filepath;
  } catch (error) {
    logger.error('Error generating resource document:', error);
    throw new Error('Failed to generate resource document');
  }
}

function createResourceTable(resourceAllocation) {
  const { estimatedHours, teamComposition, costs } = resourceAllocation;
  
  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('角色')] }),
          new TableCell({ children: [new Paragraph('预计工时')] }),
          new TableCell({ children: [new Paragraph('团队人数')] }),
          new TableCell({ children: [new Paragraph('成本估算')] })
        ]
      }),
      ...Object.keys(estimatedHours).map(role => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(role)] }),
            new TableCell({ children: [new Paragraph(estimatedHours[role].toFixed(2))] }),
            new TableCell({ children: [new Paragraph(teamComposition[role].toString())] }),
            new TableCell({ children: [new Paragraph(`¥${costs[role].toLocaleString()}`)] })
          ]
        })
      )
    ]
  });
}

module.exports = {
  generateResourceDoc
}; 