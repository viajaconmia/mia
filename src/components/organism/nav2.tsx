<div
  className={`relative h-full bg-white/70 transition-all duration-300 ${isSidebarExpanded ? "w-64" : "w-16"
    }`}
>
  <Button
    variant="ghost"
    size="md"
    className="absolute w-full right-0 top-0 z-40 h-12 flex justify-end pr-5 items-center"
    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
  >
    <ArrowIcon
      className={`transition-transform ${isSidebarOpen ? "rotate-180" : ""
        }`}
    />
  </Button>

  <ScrollArea
    className="h-full py-6"
    onMouseOver={() => setIsSidebarHovered(true)}
    onMouseOut={() => setIsSidebarHovered(false)}
  >
    <div className="space-y-4">
      <div className="px-3 py-2">
        <div className="space-y-1">
          <div className="flex gap-2 h-fit items-center mb-8 mt-4">
            <MiaIcon />
            {isSidebarExpanded && (
              <h2 className="text-xl font-semibold transition-all">
                {title}
              </h2>
            )}
          </div>

          <nav className="space-y-4">
            {/* Sección principal según el tipo */}
            <div>
              <h3 className={`px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isSidebarExpanded ? "" : "sr-only"}`}>
                {getSectionTitle(itemType)}
              </h3>
              <div className="mt-2 space-y-1">
                {(itemType === "payment" ? payments :
                  itemType === "invoice" ? invoices : bookings).map((item) => (
                    <button
                      onClick={() => handleItemClick(item.id, itemType)}
                      key={item.id}
                      className={`flex items-center justify-start w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-blue-50 hover:text-blue-900 ${currentItemId === item.id
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-500"
                        }`}
                    >
                      {renderIcon(item.type)}
                      {isSidebarExpanded && (
                        <span className="whitespace-nowrap truncate">
                          {item.title}
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </div>

            {/* Sección de items relacionados */}
            {(invoices.length > 0 || bookings.length > 0 || payments.length > 0) && (
              <div>
                <h3 className={`px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isSidebarExpanded ? "" : "sr-only"}`}>
                  Relacionados
                </h3>
                <div className="mt-2 space-y-1">
                  {/* Mostrar facturas relacionadas para pagos y reservas */}
                  {(itemType === "payment" || itemType === "booking") && invoices.map((item) => (
                    <button
                      onClick={() => handleItemClick(item.id, 'invoice')}
                      key={item.id}
                      className={`flex items-center justify-start w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-50 hover:text-gray-900 ${currentItemId === item.id
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-400"
                        }`}
                    >
                      {renderIcon('invoice')}
                      {isSidebarExpanded && (
                        <span className="whitespace-nowrap truncate">
                          {item.title}
                        </span>
                      )}
                    </button>
                  ))}

                  {/* Mostrar reservas relacionadas para pagos y facturas */}
                  {(itemType === "payment" || itemType === "invoice") && bookings.map((item) => (
                    <button
                      onClick={() => handleItemClick(item.id, 'booking')}
                      key={item.id}
                      className={`flex items-center justify-start w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-50 hover:text-gray-900 ${currentItemId === item.id
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-400"
                        }`}
                    >
                      {renderIcon('booking')}
                      {isSidebarExpanded && (
                        <span className="whitespace-nowrap truncate">
                          {item.title}
                        </span>
                      )}
                    </button>
                  ))}

                  {/* Mostrar pagos relacionados para facturas y reservas */}
                  {(itemType === "invoice" || itemType === "booking") && payments.map((item) => (
                    <button
                      onClick={() => handleItemClick(item.id, 'payment')}
                      key={item.id}
                      className={`flex items-center justify-start w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-50 hover:text-gray-900 ${currentItemId === item.id
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-400"
                        }`}
                    >
                      {renderIcon('payment')}
                      {isSidebarExpanded && (
                        <span className="whitespace-nowrap truncate">
                          {item.title}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  </ScrollArea>
</div>