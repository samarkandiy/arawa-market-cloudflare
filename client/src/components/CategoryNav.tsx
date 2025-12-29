import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCategories } from '../api/categories';
import { Category } from '../api/types';
import './CategoryNav.css';

const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { categorySlug } = useParams<{ categorySlug: string }>();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <nav className="category-nav">
      <div className="container">
        <h3>カテゴリー</h3>
        <div className="category-list">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className={`category-link ${categorySlug === category.slug ? 'active' : ''}`}
            >
              {category.nameJa}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
