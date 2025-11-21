
import { NextRequest, NextResponse } from 'next/server';

// This is a mock database of golf courses.
// In a real application, you would replace this with a call to your actual golf course API.
const MOCK_COURSES = [
  { id: '1', name: 'Pebble Beach Golf Links', location: 'Pebble Beach, CA' },
  { id: '2', name: 'Augusta National Golf Club', location: 'Augusta, GA' },
  { id: '3', name: 'St. Andrews Links (Old Course)', location: 'St Andrews, Scotland' },
  { id: '4', name: 'Pine Valley Golf Club', location: 'Pine Valley, NJ' },
  { id: '5', name: 'Cypress Point Club', location: 'Pebble Beach, CA' },
  { id: '6', name: 'Shinnecock Hills Golf Club', location: 'Southampton, NY' },
  { id: '7', name: 'Royal County Down Golf Club', location: 'Newcastle, Northern Ireland' },
  { id: '8', name: 'Royal Melbourne Golf Club', location: 'Black Rock, Australia' },
  { id: '9', name: 'Oakmont Country Club', location: 'Oakmont, PA' },
  { id: '10', name: 'Merion Golf Club (East)', location: 'Ardmore, PA' },
];

/**
 * API route to search for golf courses.
 * It expects a 'search' query parameter.
 * @param {NextRequest} request - The incoming request object.
 * @returns {NextResponse} - A JSON response with the search results.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search')?.toLowerCase();
  
  // NOTE: You would use your actual API key here. It's read from environment variables for security.
  const apiKey = process.env.GOLF_COURSE_API_KEY;

  if (!apiKey) {
    console.error('Golf Course API key is not set.');
    // For a mock API, we can proceed, but in a real app, you'd want to return an error.
    // return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  // If there's no search term, return all courses for the dropdown.
  if (!searchTerm) {
    return NextResponse.json(MOCK_COURSES);
  }

  try {
    // --- IMPORTANT ---
    // This is where you would make the call to your real external API.
    // We are simulating that call here with our mock data.
    //
    // Example of what a real API call might look like:
    // const apiResponse = await fetch(`https://yourapi.com/courses?search=${searchTerm}`, {
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`
    //   }
    // });
    // const courses = await apiResponse.json();
    
    const filteredCourses = MOCK_COURSES.filter(course =>
      course.name.toLowerCase().includes(searchTerm) || course.location.toLowerCase().includes(searchTerm)
    );

    return NextResponse.json(filteredCourses);

  } catch (error) {
    console.error('Error fetching golf course data:', error);
    return NextResponse.json({ error: 'Failed to fetch course data.' }, { status: 500 });
  }
}
