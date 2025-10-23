import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock cities API endpoint
  http.get('http://localhost:3000/api/boom/cities', () => {
    return HttpResponse.json({
      cities: [
        'New York',
        'Los Angeles',
        'Chicago',
        'Houston',
        'Phoenix',
        'Philadelphia',
        'San Antonio',
        'San Diego',
        'Dallas',
        'San Jose',
      ],
    })
  }),

  // Mock listings API endpoint
  http.get('http://localhost:3000/api/boom/listings', ({ request }) => {
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const adults = url.searchParams.get('adults')
    const children = url.searchParams.get('children')

    // Return empty results if no city
    if (!city) {
      return HttpResponse.json({ listings: [] })
    }

    // Mock property data
    const mockListings = [
      {
        id: 1,
        title: 'Luxury Downtown Apartment',
        city_name: city,
        picture: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=400&fit=crop',
        rating: 4.8,
        accommodates: parseInt(adults || '2') + parseInt(children || '0'),
        beds: 2,
        baths: 2,
        extra_info: {
          current_price: {
            total_price: 250,
            our_price: 250,
          },
        },
      },
      {
        id: 2,
        title: 'Cozy Studio with Great View',
        city_name: city,
        picture: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=400&fit=crop',
        rating: 4.5,
        accommodates: parseInt(adults || '2'),
        beds: 1,
        baths: 1,
        extra_info: {
          current_price: {
            total_price: 150,
            our_price: 150,
          },
        },
      },
    ]

    return HttpResponse.json({ listings: mockListings })
  }),
]

// Error handlers for testing error states
export const errorHandlers = [
  http.get('http://localhost:3000/api/boom/cities', () => {
    return HttpResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }),

  http.get('http://localhost:3000/api/boom/listings', () => {
    return HttpResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }),
]
