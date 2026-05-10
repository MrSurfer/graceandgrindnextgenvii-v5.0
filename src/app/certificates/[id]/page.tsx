import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/supabase/server-auth";
import { Award, Printer, ShieldCheck } from "lucide-react";
import CertificateClient from "./CertificateClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CertificatePage({ params }: Props) {
  const { id } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true, teacher: { select: { name: true } } } }
    }
  });

  if (!certificate) return notFound();

  const session = await auth();
  const isOwner = session?.user?.id === certificate.userId;

  const userName = certificate.user.name || "Student";
  const courseTitle = certificate.course.title;
  const issueDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center py-12 px-4 print:py-0 print:px-0 print:bg-white print:text-black">
      
      {/* Action Bar - Hidden during print */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 print:hidden">
        <div className="flex items-center gap-2 text-gray-400">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <span>Verified Credential</span>
        </div>
        {isOwner && <CertificateClient />}
      </div>

      {/* The Certificate Paper */}
      <div className="relative w-full max-w-4xl aspect-[1.414/1] bg-white text-gray-900 shadow-2xl overflow-hidden print:shadow-none print:w-[100vw] print:h-[100vh]">
        
        {/* Background Borders */}
        <div className="absolute inset-4 border-2 border-amber-600/30"></div>
        <div className="absolute inset-5 border border-amber-600/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-16 text-center">
          
          <div className="mb-8 flex flex-col items-center gap-2">
            <Award className="w-16 h-16 text-amber-600" />
            <h1 className="text-xl font-bold tracking-widest uppercase text-amber-700">GraceAndGrind</h1>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-2 font-bold tracking-wide">Certificate of Mastery</h2>
          <p className="text-lg text-gray-500 uppercase tracking-widest font-semibold mb-12">This is to certify that</p>

          <p className="text-4xl md:text-5xl font-serif text-amber-700 border-b-2 border-gray-200 pb-2 mb-6 px-12 italic">
            {userName}
          </p>

          <p className="text-gray-600 max-w-2xl text-lg md:text-xl leading-relaxed mb-16">
            has successfully completed the comprehensive program <br />
            <strong className="text-gray-900 font-bold">"{courseTitle}"</strong><br />
            demonstrating dedication, mastery, and a commitment to intentional growth.
          </p>

          {/* Signatures & Dates */}
          <div className="flex w-full max-w-3xl justify-between items-end mt-auto px-8">
            <div className="flex flex-col items-center text-center">
              <span className="text-lg font-serif italic text-gray-900 mb-1">{certificate.course.teacher?.name || "GraceAndGrind"}</span>
              <div className="w-48 border-t-2 border-gray-300"></div>
              <span className="text-xs uppercase tracking-widest text-gray-500 mt-2 font-bold">Lead Instructor</span>
            </div>

            <div className="w-24 h-24 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center shadow-inner relative">
               <Award className="w-10 h-10 text-amber-500" />
               <div className="absolute inset-0 border border-amber-200 rounded-full m-1"></div>
            </div>

            <div className="flex flex-col items-center text-center">
              <span className="text-lg font-serif text-gray-900 mb-1">{issueDate}</span>
              <div className="w-48 border-t-2 border-gray-300"></div>
              <span className="text-xs uppercase tracking-widest text-gray-500 mt-2 font-bold">Date of Issue</span>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 text-xs text-gray-400 font-mono">
            Credential ID: {certificate.id}
          </div>

        </div>
      </div>
    </div>
  );
}
