import React from "react";
import { Sparkles } from "lucide-react";
import { useMiaAiStudio } from "../../hooks/useMiaAiStudio";
import { MiaCompactChatSidebar } from "../organism/mia-ai/MiaCompactChatSidebar";
import { MiaWorkspaceExplorer } from "../organism/mia-ai/MiaWorkspaceExplorer";

export const MiaAiStudio: React.FC = () => {
  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    isUploading,
    activePayload,
    lastIngestedDoc,
    mobileView,
    setMobileView,
    handleSendMessage,
    handleQuickPrompt,
    handleFileUpload,
    handleRetry,
    handleResetSession,
    handleInspectMessagePayload,
    quoteMode,
    quoteFiles,
    quoteFileErrors,
    quoteDraft,
    quoteSubmit,
    handleAddQuoteFiles,
    handleRemoveQuoteFile,
    handleUpdateQuoteDraft,
    handleConfirmQuote,
    userId,
    travelers,
  } = useMiaAiStudio();

  return (
    <div className="flex flex-col md:flex-row w-full h-[calc(100dvh-4rem)] overflow-hidden bg-slate-100">
      {/* BARRA MÓVIL PARA ALTERNAR CHAT / CANVAS */}
      <div className="flex md:hidden bg-blue-900 text-white px-4 py-2 items-center justify-between shrink-0">
        <span className="font-semibold text-sm flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-sky-300" />
          MIA AI Studio
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMobileView("chat")}
            className={`px-3 py-1 rounded text-xs font-medium ${
              mobileView === "chat"
                ? "bg-white text-blue-900"
                : "bg-blue-800 text-blue-100"
            }`}
          >
            Chat Compacto
          </button>
          <button
            type="button"
            onClick={() => setMobileView("canvas")}
            className={`px-3 py-1 rounded text-xs font-medium ${
              mobileView === "canvas"
                ? "bg-white text-blue-900"
                : "bg-blue-800 text-blue-100"
            }`}
          >
            Lienzo ({quoteDraft?.items.length ?? 0})
          </button>
        </div>
      </div>

      {/* COLUMNA IZQUIERDA: ORGANISMO DE CHAT COMPACTO MULTI-AGENTE */}
      <MiaCompactChatSidebar
        visibleOnMobile={mobileView === "chat"}
        messages={messages}
        inputMessage={inputMessage}
        onChangeInputMessage={setInputMessage}
        isLoading={isLoading}
        isUploading={isUploading}
        onSendMessage={handleSendMessage}
        onQuickPrompt={handleQuickPrompt}
        onFileUpload={handleFileUpload}
        onRetry={handleRetry}
        onResetSession={handleResetSession}
        onInspectMessagePayload={handleInspectMessagePayload}
        quoteMode={quoteMode}
        quoteFiles={quoteFiles}
        quoteFileErrors={quoteFileErrors}
        onAddQuoteFiles={handleAddQuoteFiles}
        onRemoveQuoteFile={handleRemoveQuoteFile}
        quoteDraft={quoteDraft}
        userId={userId}
      />

      {/* COLUMNA DERECHA: LIENZO INTERACTIVO GRANDE */}
      <main
        className={`${
          mobileView === "canvas" ? "flex" : "hidden"
        } md:flex flex-1 h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-white p-4 md:p-6 flex-col gap-5`}
      >
        <MiaWorkspaceExplorer
          activePayload={activePayload}
          lastIngestedDoc={lastIngestedDoc}
          quoteDraft={quoteDraft}
          quoteSubmit={quoteSubmit}
          onUpdateQuoteDraft={handleUpdateQuoteDraft}
          onConfirmQuote={handleConfirmQuote}
          travelers={travelers}
        />
      </main>
    </div>
  );
};

export default MiaAiStudio;
