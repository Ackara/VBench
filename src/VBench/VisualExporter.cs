using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BenchmarkDotNet.Exporters;
using BenchmarkDotNet.Loggers;
using BenchmarkDotNet.Reports;

namespace Acklann.VBench
{
    public class VisualExporter : ExporterBase
    {
        public override void ExportToLog(Summary summary, ILogger logger)
        {
            
        }
    }
}
