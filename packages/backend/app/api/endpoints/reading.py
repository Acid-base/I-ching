@router.post("/cast")
async def cast_hexagram(request: HexagramRequest):
    """
    Cast an I Ching hexagram using either the yarrow stalk or coin method.
    """
    mode = request.mode
    verbose = request.verbose if hasattr(request, "verbose") else False
    seed = request.seed if hasattr(request, "seed") and request.seed else None

    try:
        # Map between frontend mode names and backend implementations
        if mode == "yarrow":
            # Use yarrow stalk method
            hexagram = await IChing().cast_with_yarrow_stalks()
        else:
            # Default to coins method for anything else
            hexagram = await IChing().cast_with_coins()

        # Get the reading details
        reading = await get_hexagram_by_number(hexagram.hexagram_number)

        # If there are changing lines, get the relating hexagram
        relating_hexagram = None
        if hexagram.changing_lines:
            relating_number = hexagram.get_relating_hexagram_number()
            relating = await get_hexagram_by_number(relating_number)
            relating_hexagram = {
                "number": relating_number,
                "name": relating.name,
                "judgment": relating.judgment,
                "image": relating.image,
            }

        # Format the response
        response = {
            "hexagram_number": hexagram.hexagram_number,
            "changing_lines": hexagram.changing_lines,
            "lines": hexagram.lines,
            "reading": reading,
            "relating_hexagram": relating_hexagram,
        }

        return response

    except Exception as e:
        logger.error(f"Error generating reading: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to generate reading."},
        )
