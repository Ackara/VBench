using System;

namespace Acklann.VBench
{
    internal class Contribution
    {
        public DateTime Date { get; internal set; }

        public bool WasClean { get; internal set; }

        public string Branch { get; internal set; }

        public string Sha { get; internal set; }

        public string CommitMessage { get; set; }

        public string Author { get; internal set; }

        public string Email { get; set; }

        public string EmailMD5 { get; set; }

        public string HardwareInformation { get; set; }
    }
}